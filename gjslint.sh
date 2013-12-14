#!/bin/sh

echo "Checking for Closure Lint Errors."
gjslint -r . -e node_modules --strict

echo "Done Checking Closure Errors - attempting to autofix."
fixjsstyle -r . -e node_modules --strict
