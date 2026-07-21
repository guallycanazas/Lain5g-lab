ARG BASE_IMAGE=ghcr.io/herlesupreeth/docker_open5gs@sha256:441d40e16f76ae79fc25eaaa92245850ed833bdd3d0d0dc78acbffd958cdc2c6
FROM ${BASE_IMAGE}

LABEL org.opencontainers.image.title="Lain5G-Lab Real IMS Open5GS" \
      org.opencontainers.image.source="https://github.com/guallycanazas/Lain5G-Lab" \
      org.opencontainers.image.licenses="MIT AND AGPL-3.0-only AND BSD-2-Clause" \
      org.opencontainers.image.description="Pinned Open5GS binaries with Lain5G-Lab-packaged role configurations"

COPY roles/ /mnt/
