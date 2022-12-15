#!/bin/sh

if [ -d dist ] 
then
    file="dist/config.js"
else
    file="config.js"
fi

NETWORK="${NETWORK:-main}"

configs="
window.config = {
  network: '$NETWORK',
};
"

if [ -e $file ]
then
    rm $file
fi

echo $configs > $file