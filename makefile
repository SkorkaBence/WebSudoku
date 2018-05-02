ORIGIN := www/ts
TARGET := www/js
TS_CONFIG := tsconfig.json
CLONE_FILES := DataLists
OUT_FILE := js/game.js
COMPOSER_AUTOLOAD := lib/vendor/autoload.php
CPOMPOSER_DIR := lib

CLONE_FILES_ORIGIN = $(patsubst %,$(ORIGIN)/%.ts,$(CLONE_FILES))
CLONE_FILES_TARGET = $(patsubst %,$(TARGET)/%.js,$(CLONE_FILES))

all : $(OUT_FILE) $(CLONE_FILES_TARGET) $(COMPOSER_AUTOLOAD)

.PHONY: all

$(OUT_FILE) :
	tsc -p $(TS_CONFIG)

$(CLONE_FILES_TARGET) : $(TARGET)/%.js : $(ORIGIN)/%.ts
	tsc --out $@ $<

$(COMPOSER_AUTOLOAD):
	cd $(CPOMPOSER_DIR); composer update