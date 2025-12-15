import json
from pathlib import Path
from typing import Dict, List, Any

from backend.config import get_settings


class PropertyDataLoader:
    def __init__(self, data_dir: str | None = None) -> None:
        settings = get_settings()
        self.data_dir = Path(data_dir or settings.data_dir)
        self._cache: List[Dict[str, Any]] | None = None

    def load(self, force_reload: bool = False) -> List[Dict[str, Any]]:
        if self._cache is not None and not force_reload:
            return self._cache

        basics = self._read_json("property_basics.json")
        characteristics = self._read_json("property_characteristics.json")
        images = self._read_json("property_images.json")

        characteristics_by_id = {str(item["id"]): item for item in characteristics}
        images_by_id = {str(item["id"]): item for item in images}

        merged: List[Dict[str, Any]] = []
        for basic in basics:
            pid = str(basic["id"])
            basic["id"] = pid
            characteristic = characteristics_by_id.get(pid, {})
            image_block = images_by_id.get(pid, {})
            image_url = image_block.get("image_url")
            images_list = image_block.get("images") or ([image_url] if image_url else [])
            size_value = characteristic.get("size") or characteristic.get("size_sqft")
            # Exclude 'id' from characteristic and image_block to avoid overwriting the string id
            characteristic_clean = {k: v for k, v in characteristic.items() if k != "id"}
            merged.append(
                {
                    **basic,
                    **characteristic_clean,
                    "size": size_value,
                    "size_sqft": size_value,
                    "images": images_list,
                }
            )

        self._cache = merged
        return merged

    def _read_json(self, filename: str) -> List[Dict[str, Any]]:
        file_path = self.data_dir / filename
        with file_path.open("r", encoding="utf-8") as f:
            return json.load(f)

