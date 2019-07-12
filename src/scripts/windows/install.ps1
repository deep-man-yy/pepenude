Set-Location ../../cli

#
# CLI.
# The CLI is where the neural network is located.
#
# Requirements:
# * Python3 and pip3 (I use 3.6.8)
# * CUDA 10.0
#

# PyInstaller will allow us to compile and package everything in a simple .exe
pip3 install pyinstaller

# This command should resolve and install all the necessary packages
pip3 install -r requirements-windows.txt

# NOTES from wisp101:
# Make sure pyinstaller is accessible from the cmdline as "pyinstaller".
# Otherwise, track down its folder and add it to your path. I found mine in "~/.local/bin".

Set-Location ../gui

#
# GUI.
# A wrapper of the CLI that offers a graphic interface so that its use is as simple as possible.
#
# Requirements:
# * NodeJS (In theory any recent version works.)
# * Yarn
#

# This command should resolve and install all the necessary packages
# We will not generate a .lock file to avoid problems
yarn install --force --no-lockfile

# NOTES:
# If you try to compile the program and you get an error message similar to:
# 'cross-env' is not recognized as an internal or external command
# then maybe you should restart your console or computer (the system is not detecting the packages that you just installed)
# Also be sure to check that Node and Yarn are correctly in the PATH

#
# Success
#

Write-Output "Installation completed!"
Write-Output "- Now you can run the dev-start.bat script to start modifying the GUI and see the changes in real time."
Write-Output "- Now you can run the build.bat script to compile the project and get an easy-to-use .exe"
