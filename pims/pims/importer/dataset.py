import logging
from typing import List

from cytomine import Cytomine
from cytomine.models import (
    ProjectCollection,
    Storage,
)

from pims.api.exceptions import AuthenticationException, CytomineProblem
from pims.config import get_settings
from pims.files.file import Path
from pims.importer.utils import iter_importable_files, FileImportCache, process_import_batch
from pims.schemas.auth import ApiCredentials, CytomineAuth
from pims.schemas.operations import ImportResponse

logger = logging.getLogger("pims.app")

DATASET_ROOT = Path(get_settings().dataset_path)


def run_import_datasets_easy(
    cytomine_auth: CytomineAuth,
    credentials: ApiCredentials,
    storage_id: str,
) -> ImportResponse:
    """
    Simplified import function: recursively finds all files under buckets, 
    using a configured part of the filename as the project name.
    """
    logger.info("Starting simplified dataset import process...")

    with Cytomine(**cytomine_auth.model_dump(), configure_logging=True) as c:
        if not c.current_user:
            raise AuthenticationException("PIMS authentication to Cytomine failed.")

        cyto_keys = c.get(f"userkey/{credentials.public_key}/keys.json")
        private_key = cyto_keys["privateKey"]

        c.set_credentials(credentials.public_key, private_key)

        storage = Storage().fetch(storage_id)
        if not storage:
            raise CytomineProblem(f"Storage {storage_id} not found")

        # Get all projects for lookup or creation
        project_collection = ProjectCollection().fetch()
        projects = {project.name: project for project in project_collection}
        logger.info(f"Found {len(projects)} existing projects")

        settings = get_settings()
        name_length = settings.easy_import_project_name_length
        name_offset = settings.easy_import_project_name_offset

        # Initialize FileImportCache
        file_cache = FileImportCache(settings.cache_url, settings.processed_files_cache_key)

        # Create iterator
        file_iterator = iter_importable_files(DATASET_ROOT, name_offset, name_length)

        # Process batch
        image_summary = process_import_batch(
            file_iterator=file_iterator,
            file_cache=file_cache,
            projects=projects,
            cytomine_auth=cytomine_auth,
            current_user=c.current_user,
            storage_id=storage_id
        )

        logger.info(f"Import process completed. Total: {image_summary.total}, Successful: {image_summary.successful}, Failed: {image_summary.failed}")
        return ImportResponse(
            image_summary=image_summary,
        )