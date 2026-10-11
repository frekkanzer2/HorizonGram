<img src="https://github.com/frekkanzer2/HorizonGram/blob/develop/blobs/avatar_white.png?raw=true" height="100">

Infinite cloud storage manager that uses Telegram cloud storage to upload and download files.

### Useful links
- [Learn more about HorizonGram](https://frekkanzer2.github.io/HorizonGram/introduction.html#section-1).
- [How to install](https://frekkanzer2.github.io/HorizonGram/introduction.html#section-2).
- [Updates and release notes](https://frekkanzer2.github.io/HorizonGram/release-notes.html#section-1).
- [Contributing](https://frekkanzer2.github.io/HorizonGram/api.html#section-1).
- [Wiki homepage](https://frekkanzer2.github.io/HorizonGram/).

### Quick start (recommended)
After the [Telegram and Firebase setup](https://frekkanzer2.github.io/HorizonGram/how-to-install.html#section-1), create `server/settings/config.json` from `config-template.json` and run, with any container engine supporting Compose:
```
<CONTAINER_ENGINE> compose up -d --build
```
where `<CONTAINER_ENGINE>` is the command of your container engine (for example `docker` or `podman`). Then open http://localhost:8080. More details in the [container setup guide](https://frekkanzer2.github.io/HorizonGram/how-to-install.html#section-5).
