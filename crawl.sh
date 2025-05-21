#!/bin/bash

while true; do
  set `date`
  echo "Run - $*"
  exit
  curl --silent http://localhost:3030/crawl > index.new.html
  ret=$?
  if [[ $ret -gt 0 ]]; then
    echo "Erreur d'exécution"
    exit 1
  fi
  mv ./index.new.html ./public/index.html

  #sleep `jot -r 1 400 600`
  sleep 60
done
~     
