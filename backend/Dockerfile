FROM python:3.10-slim

WORKDIR /app/backend

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

ENV PYTHONPATH="/app/backend:${PYTHONPATH}"

EXPOSE 5000

# Railway environment variable se decide karo
# RAILWAY_ENVIRONMENT=production ya development
CMD if [ "$RAILWAY_ENVIRONMENT" = "production" ]; then \
      python app.py; \
    else \
      sleep 3600; \
    fi