# GB best of automation

This project is a video processing pipeline that automates the creation of "best of" videos. It sources video clips based on data from a Google Sheet, downloads the source videos, processes them using ffmpeg to create clips, concatenates them, and uploads the final video to an AWS S3 bucket.

## Features

-   **Google Sheets Integration**: Reads spreadsheet data to determine which video clips to process.
-   **Video Downloading**: Downloads video files from an external source.
-   **Video Processing**: Uses ffmpeg to:
    -   Create individual clips from source videos.
    -   Concatenate clips into a single video file.
-   **AWS S3 Upload**: Uploads the final processed video to an S3 bucket.
-   **Containerized**: Uses Docker and Docker Compose for consistent development and production environments.

## Getting Started

### Prerequisites

-   Node.js
-   Docker
-   Access credentials for Google Cloud Platform, AWS (If using in production).

### Installation

1.  Clone the repository:
    ```sh
    git clone <repository-url>
    ```
2.  Install NPM packages:
    ```sh
    npm install
    ```
3.  Create a `.env` file in the root of the project and add the necessary environment variables for the APIs and services. See `.env.example`

## Usage

The following scripts are available to run the application:

-   **Start (local development)**: Runs the application using `tsx`.

    ```sh
    npm start
    ```

-   **Development (Docker)**: Starts the application and services using Docker Compose with the development profile.

    ```sh
    npm run dev
    ```

-   **Production (Docker)**: Starts the application and services using Docker Compose for a production environment.
    ```sh
    npm run prod
    ```
