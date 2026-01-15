
import threading
import time
from unittest.mock import MagicMock, patch, ANY

import pytest
from pims.config import Settings
from pims.importer.scanner import AutoImportScanner

@pytest.fixture
def mock_settings():
    with patch("pims.importer.scanner.get_settings") as mock:
        settings = MagicMock(spec=Settings)
        settings.enable_auto_import_scan = True
        settings.auto_import_scan_interval = 0.1
        settings.cache_url = "redis://localhost:6379"
        settings.dataset_path = "/tmp/dataset"
        settings.cytomine_public_key = "pub"
        settings.cytomine_private_key = "priv"
        settings.internal_url_core = "http://core"
        mock.return_value = settings
        yield settings

@pytest.fixture
def mock_redis():
    with patch("pims.importer.scanner.Redis") as mock:
        redis_instance = MagicMock()
        mock.from_url.return_value = redis_instance
        yield redis_instance

@pytest.fixture
def mock_cytomine():
    with patch("pims.importer.scanner.Cytomine") as mock:
        yield mock

@pytest.fixture
def mock_importer():
    with patch("pims.importer.scanner.ImageImporter") as mock:
        yield mock

def test_scanner_init(mock_settings, mock_redis):
    scanner = AutoImportScanner()
    assert scanner.interval == 0.1
    mock_redis.from_url.assert_called_with("redis://localhost:6379", decode_responses=True)

def test_acquire_lock(mock_settings, mock_redis):
    scanner = AutoImportScanner()
    scanner.acquire_lock()
    mock_redis.from_url.return_value.set.assert_called_with(
        "pims:import_lock", "locked", ex=1800, nx=True
    )

def test_should_process_new_file(mock_settings, mock_redis):
    scanner = AutoImportScanner()
    file_path = MagicMock()
    file_path.exists.return_value = True
    file_path.stat.return_value.st_mtime = 100
    file_path.stat.return_value.st_size = 500
    
    mock_redis.from_url.return_value.hget.return_value = None # Not in cache
    
    assert scanner.should_process(file_path) is True

def test_should_process_existing_file_unchanged(mock_settings, mock_redis):
    scanner = AutoImportScanner()
    file_path = MagicMock()
    file_path.exists.return_value = True
    file_path.stat.return_value.st_mtime = 100
    file_path.stat.return_value.st_size = 500
    
    mock_redis.from_url.return_value.hget.return_value = "100_500" # Match
    
    assert scanner.should_process(file_path) is False

def test_scan_cycle_locked(mock_settings, mock_redis, caplog):
    scanner = AutoImportScanner()
    # Simulate lock held
    mock_redis.from_url.return_value.set.return_value = False 
    
    scanner.scan_cycle()
    
    assert "Import lock is held by another process" in caplog.text

@patch("pims.importer.scanner.os")
def test_scan_cycle_run(mock_os, mock_settings, mock_redis, mock_cytomine, mock_importer):
    scanner = AutoImportScanner()
    mock_redis.from_url.return_value.set.return_value = True # Lock acquired
    
    # Mock file system
    mock_entry = MagicMock()
    mock_entry.is_dir.return_value = True
    mock_entry.path = "/tmp/dataset/bucket"
    mock_os.scandir.return_value = [mock_entry]
    
    mock_os.walk.return_value = [
        ("/tmp/dataset/bucket", [], ["PROJECT12345_image.tif"])
    ]
    
    # Mock file path operations
    with patch("pims.importer.scanner.Path") as MockPath:
        root_path = MagicMock()
        root_path.exists.return_value = True
        MockPath.return_value = root_path
        
        file_path_obj = MagicMock()
        file_path_obj.stem = "PROJECT12345_image"
        file_path_obj.stat.return_value.st_mtime = 100
        file_path_obj.stat.return_value.st_size = 500
        MockPath.side_effect = [root_path, MagicMock(), file_path_obj] # dataset_root, bucket, file

        # Mock Cytomine Storage
        storage = MagicMock()
        storage.id = 123
        with patch("pims.importer.scanner.Storage") as MockStorage:
            MockStorage.return_value.fetch.return_value = [storage]
            
            with patch("pims.importer.scanner.ProjectCollection") as MockPC:
                 MockPC.return_value.fetch.return_value = []
                 
                 scanner.scan_cycle()
                 
                 mock_importer.assert_called()
                 mock_redis.from_url.return_value.hset.assert_called()

