#!/bin/sh

# Output Colors
GREEN="\033[33;32m"
RESET="\033[0;00m"

echo "${GREEN}Checking for Closure Lint Errors. ${RESET}"
gjslint -r . -e node_modules --strict --jslint_error=all

echo "${GREEN}Done Checking Closure Errors - attempting to autofix. ${RESET}"
fixjsstyle -r . -e node_modules --strict --jslint_error=all
