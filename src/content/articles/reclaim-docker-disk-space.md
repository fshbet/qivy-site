---
title: 'Reclaim the space Docker quietly took'
summary: 'Free up disk space Docker used for old images, stopped containers, and build caches without touching your running containers.'
category: tips
publishDate: 2026-11-28
seoTitle: 'Reclaim Docker disk space'
metaDescription: 'Find and remove unused Docker images, containers, volumes, and build cache to free up disk space safely.'
verification: researched
sources:
  - 'https://docs.docker.com/reference/cli/docker/system/df/'
  - 'https://docs.docker.com/reference/cli/docker/system/prune/'
tags:
  - 'docker'
  - 'disk-space'
  - 'cleanup'
---
Docker keeps images, stopped containers, and build caches long after you stop using them. Over time this can consume tens of gigabytes on your computer. Here is how to see what is using space and remove it safely.

## Check how much space Docker is using

Run this command:

`docker system df`

Docker splits its use into four groups:

- Images: read-only templates used to start containers.
- Containers: running or stopped instances of those images.
- Volumes: folders Docker manages outside containers, often used to store database data.
- Build cache: saved pieces from building images, kept so the next build is faster.

The command shows how much space each group uses and how much can be reclaimed.

Reference: [Docker system df](https://docs.docker.com/reference/cli/docker/system/df/)

## Remove unused Docker objects

This command removes stopped containers, unused networks, dangling images, and the build cache:

`docker system prune`

Docker asks you to confirm. Type `y` and press Enter.

A dangling image is an image with no tag or name. It is left behind when you rebuild an image and the old version loses its tag.

Volumes are not removed by this command, because they may contain data you still need. To remove unused volumes, run:

`docker volume prune`

Confirm when asked. Only do this if you are sure you do not need the data in those volumes.

Reference: [Docker system prune](https://docs.docker.com/reference/cli/docker/system/prune/)

## Expected result

After each command, Docker reports how much space it reclaimed. Running `docker system df` again should show lower numbers under "Reclaimable" for the categories you cleaned.

Your running containers and named images stay untouched.
