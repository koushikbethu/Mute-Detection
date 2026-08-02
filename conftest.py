import os
import sys

# Ensure root directory is on PYTHONPATH for pytest
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
