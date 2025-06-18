import os, json
from datetime import datetime

def save_snapshot(service, data):
    timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    dir_path = os.path.join("snapshots", service)
    os.makedirs(dir_path, exist_ok=True)
    
    file_path = os.path.join(dir_path, f"{timestamp}.json")
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)
    
    return file_path