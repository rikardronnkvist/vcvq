# ClusterFuzzLite build configuration for JavaScript fuzzing
FROM gcr.io/oss-fuzz-base/base-builder-javascript

# Copy project files
COPY . $SRC/vcvq
WORKDIR $SRC/vcvq

# Install dependencies
RUN npm install

# Copy build script
COPY .clusterfuzzlite/build.sh $SRC/

