#!/usr/bin/env bash

function _run_gulp() {
    echo ""
    echo "Running gulp in directory $1"
    echo ""
    rm -fr "$1/lib/"
    gulp --gulpfile "$1/gulpfile.js"
}

function _run_tsc() {
    echo ""
    echo "Running tsc in directory $1"
    echo ""
    rm -fr "$1/tmp/"
    tsc -p "$1" --outDir "$1/tmp"
}

function _compile_with_gulp() {
    for i in ./basic1/ ./basic2/ ./basic3/ ./basic4/ ./extended1/ ./extended2/
    do
       _run_gulp $i
    done
}

function _compile_with_tsc() {
    for i in ./basic1/ ./basic2/ ./basic3/ ./basic4/
    do
       _run_tsc $i
    done
}

_compile_with_gulp
_compile_with_tsc
