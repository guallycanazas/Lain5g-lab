FROM ubuntu:24.04

ARG DEBIAN_FRONTEND=noninteractive
ARG UHD_VERSION=v4.10.0.0
ARG SRSRAN_PROJECT_REF=release_24_10_1
ARG SRSRAN_PROJECT_COMMIT=ef4b0749a12a3b1a8347ae01c937a621603b4069

ENV LD_LIBRARY_PATH=/usr/local/lib:${LD_LIBRARY_PATH:-}

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      bash build-essential ca-certificates cmake git gettext-base iproute2 iputils-ping \
      googletest libboost-all-dev libconfig++-dev libfftw3-dev libgmp-dev libgtest-dev libmbedtls-dev libsctp-dev \
      libssl-dev libusb-1.0-0-dev libyaml-cpp-dev ninja-build pkg-config python3 \
      python3-mako python3-numpy python3-requests python3-setuptools python3-yaml \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt

RUN git clone --depth 1 --branch "${UHD_VERSION}" https://github.com/EttusResearch/uhd.git uhd \
    && cmake -S uhd/host -B uhd/host/build -G Ninja \
      -DENABLE_ALL=OFF \
      -DENABLE_LIBUHD=ON \
      -DENABLE_X300=ON \
      -DENABLE_TESTS=OFF \
      -DENABLE_EXAMPLES=ON \
      -DENABLE_UTILS=ON \
      -DENABLE_C_API=OFF \
      -DENABLE_PYTHON_API=OFF \
      -DENABLE_MAN_PAGES=OFF \
    && cmake --build uhd/host/build \
    && cmake --install uhd/host/build \
    && ldconfig \
    && command -v uhd_find_devices \
    && command -v uhd_usrp_probe \
    && command -v uhd_config_info \
    && (command -v benchmark_rate || true) \
    && uhd_config_info --version | grep -F "4.10.0" \
    && rm -rf /opt/uhd/.git /opt/uhd/host/build

RUN git clone --depth 1 --branch "${SRSRAN_PROJECT_REF}" https://github.com/srsran/srsRAN_Project.git srsran_project \
    && cd srsran_project \
    && git fetch --depth 1 origin "${SRSRAN_PROJECT_COMMIT}" \
    && git checkout "${SRSRAN_PROJECT_COMMIT}" \
    && cmake -S . -B build -G Ninja \
      -DENABLE_EXPORT=OFF \
      -DENABLE_TESTS=OFF \
      -DENABLE_UHD=ON \
    && cmake --build build --target gnb \
    && install -m 0755 build/apps/gnb/gnb /usr/local/bin/gnb \
    && ldconfig \
    && command -v gnb \
    && gnb --version \
    && rm -rf /opt/srsran_project/.git /opt/srsran_project/build

COPY entrypoint.sh /usr/local/bin/lain5g-srsranproject-uhd-entrypoint
RUN chmod +x /usr/local/bin/lain5g-srsranproject-uhd-entrypoint

ENTRYPOINT ["lain5g-srsranproject-uhd-entrypoint"]
