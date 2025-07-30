#!/usr/bin/env bash

services=("helpdesk" "help-center" "knowledge-service" "convert")

if [[ ${services[@]} =~ $1 ]]
then
    echo "Updating SDK for ${1}..."

    #
    # using taze because pnpm update does not yet support updating catalog dependencies via the CLI
    # we can switch to using pnpm update once it supports this

    pnpm taze latest --include "@gorgias/${1}-*" --write --recursive
    pnpm install

    echo "SDK updated for ${1}"
else
    echo $'Invalid or missing service name.\n'
    echo $'Usage: pnpm update:sdk <service>\n'
    echo $"Available services: ${services[@]}"
    echo $'\n'
    exit 1
fi
