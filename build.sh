#!/usr/bin/env bash

cd ledger-web-capture
yarn build
cd ..
docker build -t leocgit/ledger-app:master .
docker push leocgit/ledger-app:master
