# Aufruf:   docker build --tag attackontitan/soldat:2026.4.1-hardened .
#               ggf. --progress=plain
#               ggf. --no-cache
#
#           Windows:   Get-Content Dockerfile | docker run --rm --interactive hadolint/hadolint:v2.14.0-debian
#           macOS:     cat Dockerfile | docker run --rm --interactive hadolint/hadolint:v2.14.0-debian
#
#           docker debug attackontitan/soldat:2026.4.1-hardened
#           docker network ls
#           docker save attackontitan/soldat:2026.4.1-hardened > soldat.tar

# https://docs.docker.com/engine/reference/builder/#syntax
# https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/reference.md
# https://hub.docker.com/r/docker/dockerfile

ARG BUN_VERSION=1.3.14

FROM oven/bun:${BUN_VERSION}-slim AS dist

WORKDIR /app

# https://docs.docker.com/engine/reference/builder/#run---mounttypebind
RUN --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=bun.lock,target=bun.lock \
  --mount=type=cache,target=/root/.bun <<EOF
  bun install --frozen-lockfile --production
EOF

FROM dhi.io/bun:${BUN_VERSION}-debian13 AS final

WORKDIR /opt/app

USER nonroot

COPY --chown=nonroot:nonroot package.json ./
COPY --from=dist --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --chown=nonroot:nonroot src ./src

# Anzeige bei "docker inspect ..."
# https://specs.opencontainers.org/image-spec/annotations
# https://spdx.org/licenses
# MAINTAINER ist deprecated https://docs.docker.com/engine/reference/builder/#maintainer-deprecated
LABEL org.opencontainers.image.title="soldat" \
  org.opencontainers.image.description="Appserver soldat mit 'hardened' Basis-Image Bun und Debian 13" \
  org.opencontainers.image.version="2026.4.1-trixie" \
  org.opencontainers.image.licenses="GPL-3.0-or-later" \
  org.opencontainers.image.authors="Juergen.Zimmermann@h-ka.de"

EXPOSE 3000
EXPOSE 3030

# Binding fuer alle Netzwerk-Interfaces
ENV BUN_BIND_HOST=0.0.0.0

# Bei CMD statt ENTRYPOINT kann das Kommando bei "docker run ..." ueberschrieben werden
# "Array Syntax" damit auch <Strg>C funktioniert
ENTRYPOINT ["bun", "run", "src/index.mts"]
