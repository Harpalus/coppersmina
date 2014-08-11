# Makefile to install Greasemonkey user scripts

# The purpose of this makefile is to be able to develop the script with an
# advanced editor that will support building through makefiles.
# To test some changes in the script you can simply push "build" and test into
# the browser.
# Using a git repository inside the Greasemonkey user script folder will not
# work because greasemonkey will empty the folder when updating the script.

# Find configuration folder for the default firefox account
configFolder = `find ~/.mozilla/firefox -name *.default -type d`
# List of user script in cwd, only the first will be installed
scriptFiles = $(wildcard *.user.js)
# Only the first script in scriptFiles will be installed . For this to work the
# makefile target must require scriptFiles variable
scriptFile = $<
# Extract script name from the user script header
# 1- grep extract the @name metadata
# 2- first sed remove "// @name " even if multiple blank character are used
# 3- second sed removes trailing blank characters
# 4- last sed replaces spaces between words with underscore
# $$ is required for escaping the dollar symbol in makefile
scriptName = `grep '^//[[:space:]]*@name[[:space:]]' '$(scriptFile)' | sed -e 's/^\/\/[[:space:]]*@name[[:space:]]*//' | sed -e 's/[[:space:]]*$$//' -e 's/ /_/g'`
# Where to copy the file
scriptFolder = $(configFolder)"/gm_scripts/"$(scriptName)

all: help

# target: help	- print valid targets
.PHONY : help
help: $(scriptFiles)
	@echo "Makefile for installing user scripts into Greasemonkey"
	@echo "User script folder is: 		'$(configFolder)'"
	@echo "Script file to be installed: 	'$(scriptFile)'"
	@echo "Script name: 			'$(scriptName)'"
	@echo "Script will be installed in 	'$(scriptFolder)'"
	@echo "Valid makefile targets:"
	@egrep "^# target:" [Mm]akefile

# target: install	- install user scripts from current folder to Greasemonkey gm_scripts folder
.PHONY : install
install: $(scriptFiles)
	@echo "Installing file '$(scriptFile) containing user the script named '$(scriptName)' into directory '$(scriptFolder)'"
	@cp $(scriptFile) $(scriptFolder)

# target: ls	- Display firefox user script folder content
.PHONY : ls
ls: $(scriptFiles)
	@echo "Content of $(scriptFolder)"
	@ls -lah $(scriptFolder)

# target: clean	- Delete installed user scripts from the script folder
.PHONY : clean
clean: $(scriptFiles)
	@echo "Removing '$(scriptFile)' from '$(scriptFolder)'"
	rm $(scriptFolder)/$(scriptFile)
	ls -la $(scriptFolder)
