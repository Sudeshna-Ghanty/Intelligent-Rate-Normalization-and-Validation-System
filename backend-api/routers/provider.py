from fastapi import APIRouter
from services.db_client import get_providers

router = APIRouter()

@router.get("/search")
def search_providers(
    tax_id: str | None = None,
    npi: str | None = None,
    provider_name: str | None = None,
    provider_type: str | None = None,
    specialty: str | None = None
):
    params = locals()
    return get_providers({k: v for k, v in params.items() if v})


# router.get("/all")
# def get_all_providers():
#     """
#     Fetches all providers from DB service
#     """
#     return get_providers({})