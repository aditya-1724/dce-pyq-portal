FROM python:3.10-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

# JSON array format mein CMD
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]