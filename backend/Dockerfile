FROM python:3.10-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Ensure all files are in /app
COPY . .

# Print current directory for debugging
RUN pwd && ls -la

EXPOSE 5000

# Start from correct directory
WORKDIR /app
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]