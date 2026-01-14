from fastapi import FastAPI
from routers import provider, contract, fee_schedule, rate_intake, finalize
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Backend API Gateway")

# Add CORS middleware first
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow only your frontend URL or use ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include routers for different API endpoints
app.include_router(provider.router, prefix="/providers")
app.include_router(contract.router, prefix="/contracts")
app.include_router(fee_schedule.router, prefix="/fee-schedules")
app.include_router(rate_intake.router, prefix="/rate-intake")
app.include_router(finalize.router, prefix="/finalize")
