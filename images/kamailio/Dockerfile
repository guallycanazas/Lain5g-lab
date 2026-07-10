FROM debian:bookworm-slim

ARG DEBIAN_FRONTEND=noninteractive
ARG KAMAILIO_VERSION=5.8.8

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      bison \
      build-essential \
      ca-certificates \
      flex \
      git \
      libpcre3-dev \
      libssl-dev \
      make \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt

RUN git clone --depth 1 --branch "${KAMAILIO_VERSION}" https://github.com/kamailio/kamailio.git kamailio \
    && cd kamailio/src \
    && make cfg PREFIX=/usr/local include_modules="sl tm textops siputils xlog" \
    && make all -j"$(nproc)" \
    && make install \
    && command -v kamailio \
    && kamailio -v \
    && rm -rf /opt/kamailio/.git

ENTRYPOINT ["kamailio"]
