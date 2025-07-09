#!/bin/bash
aws s3api create-bucket \
  --bucket gb-best-of-videos \
  --endpoint-url http://localhost:4566 \
  --create-bucket-configuration LocationConstraint=eu-west-2
  