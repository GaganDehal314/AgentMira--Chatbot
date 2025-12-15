import pickle
from pathlib import Path
from typing import Any, Dict, Optional

from backend.config import get_settings


class PriceModel:
    def __init__(self) -> None:
        self._model = self._load_model()

    def _load_model(self):
        settings = get_settings()
        path = Path(settings.model_path)
        if not path.exists():
            return None
        try:
            with path.open("rb") as f:
                return pickle.load(f)
        except Exception:
            # Fallback if unpickling fails (e.g., missing deps)
            return None

    def predict_price(self, features: Dict[str, Any], fallback_price: Optional[float] = None) -> float:
        if self._model is None:
            return fallback_price if fallback_price is not None else 0.0
        try:
            pred = self._model.predict(features)
            # handle list/ndarray or scalar
            if isinstance(pred, (list, tuple)) and pred:
                return float(pred[0])
            if hasattr(pred, "__iter__"):
                first = next(iter(pred))
                return float(first)
            return float(pred)
        except Exception:
            return fallback_price if fallback_price is not None else 0.0


price_model = PriceModel()


