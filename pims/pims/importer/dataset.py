import logging
import os
from collections import defaultdict
from lxml import etree
from typing import List

from cytomine import Cytomine
from cytomine.models import (
    ImageInstanceCollection,
    OntologyCollection,
    ProjectCollection,
    Storage,
)

from pims.api.exceptions import AuthenticationException, CytomineProblem
from pims.api.utils.cytomine_auth import sign_token
from pims.config import get_settings
from pims.files.file import Path
from pims.importer.annotation import AnnotationImporter
from pims.importer.ontology import OntologyImporter
from pims.importer.image import ImageImporter
from pims.importer.metadata import MetadataValidator
from pims.importer.utils import get_project
from pims.schemas.auth import ApiCredentials, CytomineAuth
from pims.schemas.operations import ImportResponse, ImportSummary

logger = logging.getLogger("pims.app")

DATASET_ROOT = Path(get_settings().dataset_path)
WRITING_PATH = Path(get_settings().writing_path)
FILE_ROOT_PATH = Path(get_settings().root)


class BucketParser:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.datasets = {}
        self.dependency = defaultdict(list)

    @property
    def parent(self) -> str:
        return next(iter(self.dependency.keys()))

    @property
    def children(self) -> List[str]:
        return next(iter(self.dependency.values()))

    def discover(self) -> None:
        for child in self.root.iterdir():
            if not child.is_dir():
                logger.warning(f"'{child}' is not a folder!")
                logger.warning(f"Skipping '{child}' ...")
                continue
            logger.info(f"child: {child}")
            metadata_path = child / "METADATA"
            if not metadata_path.exists():
                logger.warning(f"'{metadata_path}' does not exist!")
                logger.warning(f"Skipping '{child}' ...")
                continue
            logger.info(f"child / METADATA: {metadata_path}")
            metadata_dataset_path = metadata_path / "dataset.xml"
            if not metadata_dataset_path.exists():
                logger.warning(f"'{metadata_dataset_path}' does not exist!")
                logger.warning(f"Skipping '{child}' ...")
                continue
            logger.info(f"child / METADATA / dataset.xml: {metadata_dataset_path}")
            tree = etree.parse(metadata_dataset_path)
            root = tree.getroot()

            dataset = root.find(".//DATASET")
            dataset_name = dataset.get("alias")
            logger.info(f"dataset_name: {dataset_name}")
            self.datasets[dataset_name] = child

            complement = root.find(".//COMPLEMENTS_DATASET_REF")
            if complement is not None:
                self.dependency[complement.get("alias")].append(dataset_name)
                logger.info(f"dependency:")


def run_import_datasets(
    cytomine_auth: CytomineAuth,
    credentials: ApiCredentials,
    storage_id: str,
) -> ImportResponse:
    buckets = (Path(entry.path) for entry in os.scandir(DATASET_ROOT) if entry.is_dir())

    with Cytomine(**cytomine_auth.model_dump(), configure_logging=True) as c:
        if not c.current_user:
            raise AuthenticationException("PIMS authentication to Cytomine failed.")

        cyto_keys = c.get(f"userkey/{credentials.public_key}/keys.json")
        private_key = cyto_keys["privateKey"]

        logger.info(f"public_key from credentials: {credentials.public_key}")
        logger.info(f"private_key from credentials: {private_key}")

        # if sign_token(private_key, credentials.token) != credentials.signature:
        #     raise AuthenticationException("Authentication to Cytomine failed")

        c.set_credentials(credentials.public_key, private_key)

        storage = Storage().fetch(storage_id)
        if not storage:
            raise CytomineProblem(f"Storage {storage_id} not found")

        project_collection = ProjectCollection().fetch()
        projects = {project.name: project for project in project_collection}

        annotation_summary = {}
        image_summary = ImportSummary()
        for bucket in buckets:
            logger.info(f"bucket: {bucket}")
            parser = BucketParser(bucket)
            parser.discover()

            try:
                parent_dataset = parser.parent
            except Exception :
                logger.warning(f"Skipping {bucket} ...")
                continue

            validator = MetadataValidator()
            logger.info(f"'{bucket / parent_dataset } / METADATA' metadata validation ...")
            if validator.validate(bucket / parent_dataset / "METADATA"):
                logger.info(f"'{parent_dataset}' metadata validated successfully.")

            project = get_project(parent_dataset, projects)

            image_summary = ImageImporter(
                bucket / parent_dataset,
                cytomine_auth,
                c.current_user,
                storage_id,
            ).run(projects=[project])

            images = ImageInstanceCollection().fetch_with_filter("project", project.id)
            ontologies = OntologyCollection().fetch()

            # for child in parser.children:
            #     child_path = bucket / child
            #     ontology = OntologyImporter(child_path).run()
            #     ontologies.append(ontology)

            #     if project.ontology is None:
            #         project.ontology = ontology.id
            #         project.update()

            #     result = AnnotationImporter(child_path, images, ontologies).run()
            #     annotation_summary[child] = result

        return ImportResponse(
            image_summary=image_summary,
            # annotation_summary=image_summary,
        )


def run_import_datasets_easy(
    cytomine_auth: CytomineAuth,
    credentials: ApiCredentials,
    storage_id: str,
) -> ImportResponse:
    """
    简化版导入函数，递归查找bucket下的所有文件，文件名前12个字符作为项目名
    如果文件名（不含后缀）长度小于12个字符，则跳过
    """
    logger.info("Starting simplified dataset import process...")
    buckets = (Path(entry.path) for entry in os.scandir(DATASET_ROOT) if entry.is_dir())

    with Cytomine(**cytomine_auth.model_dump(), configure_logging=True) as c:
        if not c.current_user:
            raise AuthenticationException("PIMS authentication to Cytomine failed.")

        cyto_keys = c.get(f"userkey/{credentials.public_key}/keys.json")
        private_key = cyto_keys["privateKey"]

        logger.info(f"public_key from credentials: {credentials.public_key}")
        logger.info(f"private_key from credentials: {private_key}")

        c.set_credentials(credentials.public_key, private_key)

        storage = Storage().fetch(storage_id)
        if not storage:
            raise CytomineProblem(f"Storage {storage_id} not found")

        # 获取所有项目，用于后续查找或创建项目
        project_collection = ProjectCollection().fetch()
        projects = {project.name: project for project in project_collection}
        logger.info(f"Found {len(projects)} existing projects")

        image_summary = ImportSummary()
        for bucket in buckets:
            logger.info(f"Processing bucket: {bucket}")
            
            # 递归遍历bucket下的所有文件
            file_count = 0
            for root, dirs, files in os.walk(bucket):
                for file in files:
                    file_path = Path(root) / file
                    file_count += 1
                    
                    # 分离文件名和扩展名
                    stem = file_path.stem  # 不含扩展名的文件名
                    if len(stem) < 12:
                        logger.warning(f"Skipping file '{file_path}' - filename without extension is less than 12 characters: '{stem}' (length: {len(stem)})")
                        continue
                    
                    # 使用文件名的前12个字符作为项目名
                    project_name = stem[:12]
                    logger.info(f"Processing file: {file}, derived project name: {project_name}")
                    
                    # 获取或创建项目
                    project = get_project(project_name, projects)
                    logger.info(f"Project {project_name} {'already existed' if project.id else 'was created'}")
                    
                    # 使用ImageImporter的run_easy方法导入单个文件
                    importer = ImageImporter(
                        base_path=bucket,  # 传入bucket路径，虽然run_easy不使用它
                        cytomine_auth=cytomine_auth,
                        user=c.current_user,
                        storage_id=storage_id,
                    )
                    
                    result = importer.run_easy(file_path, projects=[project])
                    
                    # 更新导入结果统计
                    image_summary.total += 1
                    if result.success:
                        image_summary.successful += 1
                        logger.info(f"Successfully imported file: {file_path.name}")
                    else:
                        image_summary.failed += 1
                        logger.error(f"Failed to import file: {file_path.name}, reason: {result.message}")
                    
                    image_summary.results.append(result)

            logger.info(f"Finished processing bucket {bucket}, total files processed: {file_count}")

        logger.info(f"Import process completed. Total: {image_summary.total}, Successful: {image_summary.successful}, Failed: {image_summary.failed}")
        return ImportResponse(
            image_summary=image_summary,
        )
