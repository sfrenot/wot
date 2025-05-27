#!/bin/bash

while true; do
  set `date`
  echo "Run clan stats - $*"
  curl --silent http://localhost:3030/history
  ret=$?
  if [[ $ret -gt 0 ]]; then
    echo "Erreur d'exécution ($ret)"
    exit 1
  fi
  sleep 86400
done
~     
