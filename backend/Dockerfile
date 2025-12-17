# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app/backend
COPY . ./backend

# Set PYTHONPATH to include /app so we can import 'backend' package
ENV PYTHONPATH=/app

# Expose port 8000
EXPOSE 8000

# Run migrations and then start the app
CMD /bin/sh -c "cd backend && alembic upgrade head && cd .. && uvicorn backend.main:app --host 0.0.0.0 --port 8000"
