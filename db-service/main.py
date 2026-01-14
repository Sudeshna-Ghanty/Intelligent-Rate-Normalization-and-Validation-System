from fastapi import FastAPI
from routers import provider, provider_contract, fee_schedule, service_rate

app = FastAPI(title="DB Service")

@app.get("/health")
def health():
    return {"status": "db-service-up"}

app.include_router(provider.router, prefix="/providers")
app.include_router(provider_contract.router, prefix="/contracts")
app.include_router(fee_schedule.router, prefix="/fee-schedules")
app.include_router(service_rate.router, prefix="/service-rates")
