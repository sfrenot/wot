#!/bin/bash

HEURE_LIMITE=18

while true; do
  set `date +%H`
  if [ "$*" -lt $HEURE_LIMITE ]; then
    set `date`
    echo "Run - $*"
    curl --silent http://localhost:3030/crawl > index.new.html
    ret=$?
    if [[ $ret -gt 0 ]]; then
      echo "Erreur d'exécution ($ret)"
      exit 1
    fi
    mv ./index.new.html ./public/index.html
  fi 
  echo "coucou"

  sleep 30
done
~     
