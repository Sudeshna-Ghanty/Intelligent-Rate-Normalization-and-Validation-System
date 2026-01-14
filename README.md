# Intelligent-Rate-Normalization-and-Validation-System
Built an AI-assisted healthcare platform to ingest, normalize, and validate provider fee schedules using FastAPI and React. Implemented semantic description matching, rule-based rate normalization, confidence scoring, and human-in-the-loop review workflows for enterprise contract validation.
Problem Statement- Healthcare payers and insurance organizations manage provider fee schedules and rate sheets originating from heterogeneous sources such as Excel files, PDFs, and manually maintained documents. These datasets suffer from:
Inconsistent service code naming and descriptions
Non-standard date formats and overlapping effective periods
Manual data entry errors and versioning issues
Lack of automated validation against contractual rules
Such inconsistencies introduce financial leakage, compliance risks, and high operational overhead during provider contract intake and reconciliation.

Solution Overview- This project implements a data-driven, rule-aware rate normalization and validation system designed to standardize, validate, and audit provider fee schedules in a scalable and explainable manner.
The system:
Normalizes heterogeneous rate data into a unified schema
Detects structural, semantic, and temporal inconsistencies
Applies deterministic and AI-assisted validation rules
Produces traceable validation outputs suitable for audits
The architecture emphasizes correctness, modularity, and extensibility, aligning with real-world healthcare analytics systems.

System Architecture
Processing Pipeline:
Ingestion of structured and semi-structured rate datasets
Schema normalization and service code harmonization
Effective date validation and conflict resolution
Rule-based and AI-assisted anomaly detection
Confidence-scored validation output with explanations

Tech Stack
Language: Python
Backend: FastAPI
Data Processing: Pandas, NumPy
Persistence: SQLite
Validation Logic: Rule-based + AI-assisted reasoning
APIs: RESTful service design
Tooling: Git, GitHub

Key Outcomes-
Improved data consistency and contract integrity
Reduced manual intervention in rate validation
Transparent and auditable decision outputs
Scalable architecture suitable for enterprise systems

Academic Relevance-
This project demonstrates:
Applied data engineering and backend system design
Schema modeling and validation pipelines

Real-world use of AI for decision support

Strong alignment with Computer Science, Data Engineering, and Data Science Master’s programs
