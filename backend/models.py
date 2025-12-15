from datetime import datetime
from typing import Any, Dict


def saved_property_doc(user_id: str, property_id: str) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "userId": user_id,
        "propertyId": property_id,
        "savedAt": now,
        "updatedAt": now,
    }

