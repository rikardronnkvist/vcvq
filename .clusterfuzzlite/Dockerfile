# ClusterFuzzLite build configuration for JavaScript fuzzing
FROM gcr.io/oss-fuzz-base/base-builder-javascript@sha256:22909068a925ec5ae236083a082320b78cb9b8e648edaea35b6d16004ca3bda1

# Copy project files
COPY . $SRC/vcvq
WORKDIR $SRC/vcvq

# Install dependencies
RUN npm ci

# Copy build script
COPY .clusterfuzzlite/build.sh $SRC/

