

# Ollama Proxy
================

A system built to prevent people from using the Ollama API willy-nilly if you have it exposed to the interwebs. Requires API keys.

## Table of Contents
-----------------

* [Overview](#overview)
* [Features](#features)
* [Getting Started](#getting-started)
* [API Documentation](#api-documentation)
* [Security](#security)
* [License](#license)

## Overview
------------

Ollama Proxy is a Node.js application that acts as a reverse proxy for the Ollama API. It provides an additional layer of security and authentication for API requests.

## Features
------------

* **API Key Authentication**: Ollama Proxy requires API keys for authentication, ensuring that only authorized requests are forwarded to the Ollama API.
* **Streaming Support**: Ollama Proxy supports streaming responses from the Ollama API, allowing for efficient handling of large data transfers.
* **Error Handling**: Ollama Proxy catches and handles errors from the Ollama API, providing a more robust and reliable experience.
* **Key Generation**: Using CLI you can automatically generate new api keys. OLLAMA-UUID format.

## Getting Started
-----------------

### Prerequisites

* Node.js (version 14 or later)


### Dependencies
* express
* fs
* path
* crypto

### Installation

1. Clone the repository: `git clone https://github.com/your-username/ollama-proxy.git`
2. Install dependencies: `npm install`
3. Create file authTokens.json
4. Start the server: `node proxy.js`
5. Enter `generateAPIKey` to generate your first key

## API Documentation
-------------------

### Endpoints

* `POST /v1/chat/completions`: Forward requests to the Ollama API for chat completions.

### Request Header
* `Authorization`: This is a required header, it should contain `Bearer <API-KEY>`

### Request Body

* `model`: The model to use for chat completions.
* `messages`: The messages to complete.
* `stream`: Optional flag to enable streaming responses.

### Response

* `200 OK`: Successful response from the Ollama API.
* `401 Unauthorized`: Invalid API key or authentication error.
* `500 Internal Server Error`: Error from the Ollama API.

## To-Do
* Allow streaming (will work with a streaming flag set, but will not actually stream yet)

## Security
------------

Ollama Proxy uses API keys for authentication and ensures that only authorized requests are forwarded to the Ollama API.

## License
---------

Ollama Proxy is licensed under the MIT License.