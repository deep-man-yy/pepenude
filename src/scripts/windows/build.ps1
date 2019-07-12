Set-Location ../../cli

#
# CLI.
# The CLI is where the neural network is located.
#
# Requirements:
# * Python3 and pip3 (I use 3.6.8)
# * CUDA 10.0
#

# PyInstaller will begin to compile the script and package
# everything necessary in a directory with the final .exe
# Relax and enjoy your coffee :)

pyinstaller main.py -y --onedir --name "cli" --distpath "../../dist"

#

Set-Location ../gui

#
# GUI.
# A wrapper of the CLI that offers a graphic interface so that its use is as simple as possible.
#
# Requirements:
# * NodeJS 10+
# * Yarn
#

# electron-build will begin to compile the NuxtJS project
# Relax more and enjoy more your coffee :))

yarn build

#

Set-Location ../../dist

# We need to move the generated folder to the final folder

if ( Test-Path ./gui ) {
  Remove-Item ./gui
}

Move-Item ./gui-unpacked/win-unpacked ./gui -Force

# We delete the generated folder

Remove-Item –path ./gui-unpacked -recurse

#
# Success
#

Write-Output ("Build completed!")
Write-Output ("It should have generated a folder called dist/, inside you will find the final project files that you can share with everyone!")
Write-Output ("Enjoy and remember to respect the License!")