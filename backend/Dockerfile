FROM python:3.10-slim

WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all code
COPY . .

# Set Python path to include /app
ENV PYTHONPATH="/app:${PYTHONPATH}"

EXPOSE 5000

# Print debug info
RUN echo "Current directory: $(pwd)" && ls -la

# Sleep for 1 hour for debugging
CMD ["sleep", "3600"]