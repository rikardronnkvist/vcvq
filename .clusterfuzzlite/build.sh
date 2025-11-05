#!/bin/bash -eu
# Build script for ClusterFuzzLite

# Install dependencies
cd $SRC/vcvq
npm install

# Copy fuzz targets
cp tests/clusterfuzz/*.js $OUT/

# The fuzz targets are now in $OUT and will be run by ClusterFuzzLite
echo "Fuzz targets built successfully"

