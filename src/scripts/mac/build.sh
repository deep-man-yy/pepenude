#!/bin/bash

cd ../../cli

#
# CLI.
# The CLI is where the neural network is located.
#
# Requirements:
# * Python3 and pip3 (I use 3.6.8)
# * CUDA 10.0
#

# PyInstaller will begin to compile the script and package
# everything necessary in a directory with the final binary
# Relax and enjoy your coffee :)

pyinstaller main.py -y --onedir --name "cli" --distpath "../../dist"

#

cd ../gui

#
# GUI.
# A wrapper of the CLI that offers a graphic interface so that its use is as simple as possible.
#
# Requirements:
# * NodeJS 10+
# * Yarn
#

# Electron-build will begin to compile the NuxtJS project
# and place everything necessary in a directory with the final binary
# Relax more and enjoy more your coffee :))

yarn build

#

cd ../../dist

# We need to move the generated folder to the final folder

rm -r -f "./gui"

mv ./gui-unpacked/linux-unpacked ./gui

# We delete the generated folder

rm -r -f ./gui-unpacked

#
# Success
#

echo "Build completed!"
echo "It should have generated a folder called dist/, inside you will find the final project files that you can share with everyone!"
echo "Enjoy and remember to respect the License!"
