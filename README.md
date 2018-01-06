# Ledger App

This my version of the rather unorthodox `ledger-web` app by Peter
Keen (See [peterkeen/ledger-app](https://github.com/peterkeen/ledger-app)).

## Building

For building first build the react components, then build the container:

```sh
cd ledger-web-capture
yarn build
cd ..
docker-compose build app watcher
```

## Running the app via docker

Make sure you have an environment variable `LEDGER_DIR` that can be
used by the `docker-compose.yml` file.

```sh
docker-compose run -p 4040:4040 app
```

The docker-compose file specifies a watcher service, that runs `rake
load` any time a ledger file changes.

## Docker Compose

The basic configuration looks like this:

```yml
postgres:
  image: postgres:9.6
  volumes:
    - ./tmp/postgres:/var/lib/postgresql/data
app:
  build: .
  ports:
    - 4040:4040
  volumes:
    - .:/app
    - ${LEDGER_DIR}:/ledger
  environment:
    PORT: 4040
    DB_HOST: postgres
    DB_PORT: 5432
    DB_USERNAME: postgres
    DB_PASSWORD:
    LEDGER_FILE: /ledger/main.ledger
    LEDGER_CAPTURE_FILE: /ledger/personal.ledger
  links:
    - postgres
watcher:
  build: .
  command: ["guard", "-w", "/ledger"]
  tty: true
  volumes:
    - .:/app
    - ${LEDGER_DIR}:/ledger
  environment:
    PORT: 4040
    DB_HOST: postgres
    DB_PORT: 5432
    DB_USERNAME: postgres
    DB_PASSWORD:
    LEDGER_FILE: /ledger/main.ledger
  links:
    - postgres
```

## Additional services

I have some additional docker containers, that may be nice for you too?

### Ledgit

Ledgit connects to your banks web interface, grabs CSVs, tries to
classify the account for each transaction and appends them to a
configured ledger file.

Add that to your `docker-compose.yml`:

```yml
ledgit:
  image: leocgit/ledgit
  volumes:
    - ${LEDGER_DIR}:/home/arthur/.ledger
    - ledgit.json:/root/.ledgit.json
  command:
    - "sh"
    - "-c"
    - "/root/go-cron \"0 0 */3 * * *\" /app/bin/ledgit"
```

This will check for new transactions every three hours.

Further reading at:

* [Github Repo](https://github.com/leoc/ledgit)
* [Dockerhub](https://hub.docker.com/r/leocgit/ledgit/)

### Gitdocs

Gitdocs commits each file change automatically to git and pushes the
repository. This is how I sync all my ledger or org repositories.

```yml
gitdocs:
  image: leocgit/gitdocs
  tty: true
  environment:
    GIT_USER_NAME: "LedgerWeb"
    GIT_USER_EMAIL: "my@mail.berlin"
    GIT_REMOTE_NAME: ssh_host
    GIT_REMOTE_HOSTNAME: ssh_host
    GIT_REMOTE_USERNAME: remote_user
  volumes:
    - ${LEDGER_DIR}:/repos/ledgerfiles
    - ./id_rsa:/root/.ssh/id_rsa
```

Further reading at:

* [Github Repo](https://github.com/leoc/docker-gitdocs)
* [Dockerhub](https://hub.docker.com/r/leocgit/gitdocs/)
