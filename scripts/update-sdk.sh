#!/usr/bin/env bash

services=("helpdesk" "help-center" "knowledge-service" "convert" "ecommerce-storage" "workflows")

if [[ ${services[@]} =~ $1 ]]
then
    echo -e "\nUpdating SDK for ${1}...\n"

    #
    # using taze because pnpm update does not yet support updating catalog dependencies via the CLI
    # we can switch to using pnpm update once it supports this

    pnpm taze latest --include "@gorgias/${1}-*" --write --recursive
    pnpm install --ignore-scripts

    echo "SDK updated for ${1}"
elif [[ $1 == "all" ]]
then
    echo "Updating all SDKs..."
    for service in "${services[@]}"; do
        $0 ${service} -v
    done
else
    echo $'Invalid or missing service name.\n'
    echo $'Usage: pnpm update:sdk <service>\n'
    echo $"Available services: ${services[@]}"
    echo $'\n'
    exit 1
fi
