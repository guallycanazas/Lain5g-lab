FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive
ARG SRSRAN_4G_VERSION=release_23_11
ARG SRSRAN_4G_COMMIT=

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      bash build-essential ca-certificates cmake git iproute2 iputils-ping \
      libboost-program-options-dev libconfig++-dev libfftw3-dev libmbedtls-dev \
      libsctp-dev libzmq3-dev pkg-config python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt

RUN git clone --depth 1 --branch "${SRSRAN_4G_VERSION}" https://github.com/srsran/srsRAN_4G.git srsran4g \
    && cd srsran4g \
    && if [ -n "${SRSRAN_4G_COMMIT}" ]; then git fetch --depth 1 origin "${SRSRAN_4G_COMMIT}" && git checkout "${SRSRAN_4G_COMMIT}"; fi \
    && cmake -S . -B build -DENABLE_ZEROMQ=ON -DENABLE_UHD=OFF -DENABLE_GUI=OFF \
    && cmake --build build -j"$(nproc)" \
    && cmake --install build \
    && ldconfig \
    && command -v srsenb \
    && command -v srsue \
    && rm -rf /opt/srsran4g/.git /opt/srsran4g/build

COPY entrypoint.sh /usr/local/bin/lain5g-srsran4g-sim-entrypoint
RUN chmod +x /usr/local/bin/lain5g-srsran4g-sim-entrypoint

ENTRYPOINT ["lain5g-srsran4g-sim-entrypoint"]
