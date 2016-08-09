BIN = ./node_modules/.bin
SRC = $(wildcard src/* src/*/*)
TEST = $(wildcard test/* test/*/*)

build: index.js

index.js: src/index.js $(SRC)
	$(BIN)/rollup $< -c > $@

test.js: test/index.js $(TEST) $(SRC)
	$(BIN)/rollup $< -c > $@

test: test.js
	node $<

clean:
	rm -rf index.js test.js

.PHONY: build clean test
