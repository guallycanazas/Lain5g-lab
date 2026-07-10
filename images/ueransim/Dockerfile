FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive
ARG UERANSIM_VERSION=v3.2.6
ARG UERANSIM_COMMIT=

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        bash \
        build-essential \
        ca-certificates \
        cmake \
        git \
        iproute2 \
        iputils-ping \
        lksctp-tools \
        libsctp-dev \
        make \
        net-tools \
        tcpdump \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt

RUN git clone --depth 1 --branch "${UERANSIM_VERSION}" https://github.com/aligungr/UERANSIM.git ueransim \
    && cd ueransim \
    && if [ -n "${UERANSIM_COMMIT}" ]; then \
        git fetch --depth 1 origin "${UERANSIM_COMMIT}" && git checkout "${UERANSIM_COMMIT}"; \
    fi \
    && make \
    && install -m 0755 build/nr-gnb /usr/local/bin/nr-gnb \
    && install -m 0755 build/nr-ue /usr/local/bin/nr-ue \
    && command -v nr-gnb \
    && command -v nr-ue \
    && nr-gnb --version >/dev/null 2>&1 || true \
    && nr-ue --version >/dev/null 2>&1 || true \
    && rm -rf /opt/ueransim/.git

COPY entrypoint.sh /usr/local/bin/lain5g-ueransim-entrypoint
RUN chmod +x /usr/local/bin/lain5g-ueransim-entrypoint

ENTRYPOINT ["lain5g-ueransim-entrypoint"]
