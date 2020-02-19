SHELL:=/bin/bash
CWD=$(shell pwd)
BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
DB_REBUILD=db:drop db:create db:schema:load db:migrate

setup: build db-build-all
	@echo 'Setup completed successfully'

test: prep-docker-environment
	docker-compose run --rm -e RAILS_ENV=test web bundle exec rake test

integration-test: RAILS_ENV=test
integration-test: remove-server-pid
	docker-compose up --abort-on-container-exit integration-test

guard: prep-docker-environment
	docker-compose run --rm -e RAILS_ENV=test web bundle exec guard --group rails

local-regression-test:
ifeq ($(CYPRESS_RECORD_KEY),)
	@echo "missing CYPRESS_* variables"
	@echo "load .env before running"
	@echo ""
	@echo "export \$$$ (egrep -v '^#' .env | xargs)"
	@exit 2
else
	circleci local execute --job feature_tests \
		-e CYPRESS_TOKEN_ENCRYPTION_KEY=$(CYPRESS_TOKEN_ENCRYPTION_KEY) \
		-e CYPRESS_RECORD_KEY=$(CYPRESS_RECORD_KEY) \
		-e CYPRESS_GRP1_COLLAB_USERNAME=$(CYPRESS_GRP1_COLLAB_USERNAME) \
		-e CYPRESS_GRP1_COLLAB_PASSWORD=$(CYPRESS_GRP1_COLLAB_PASSWORD)
endif

regression-test:
ifeq ($(CIRCLECI_TOKEN),)
	@echo "missing CIRCLECI_TOKEN"
	@echo "load .env before running"
	@echo ""
	@echo "export \$$$ (egrep -v '^#' .env | xargs)"
	@exit 2
else
	curl --user $(CIRCLECI_TOKEN): --header "Content-Type: application/json" \
		--data "{\"build_parameters\": {\"CIRCLE_JOB\": \"feature_tests\"}}" \
		--request POST "https://circleci.com/api/v1.1/project/github/codetree/codetree/tree/$(BRANCH)"
endif

open-tunnel:
ifeq  ($(CODETREE_TUNNEL_ID),)
	@echo "set the CODETREE_TUNNEL_ID environment variable before running:"
	@echo ""
	@echo "    export CODETREE_TUNNEL_ID=<id>"
else
	curl -Ls https://burrow.io/$(CODETREE_TUNNEL_ID) | bash -s
endif

server: RAILS_ENV=development
server: prep-docker-environment remove-server-pid
	docker-compose up web worker

prep-docker-environment:
ifeq ("$(wildcard .env)","")
	@echo "Your environment variables do not exist.  create a .env file;  see example.env"
	@exit 1
endif

remove-server-pid:
	# remove server pid if it exists
	rm -f tmp/pids/server.pid

# run from ec2 container only when s3 bucket becomes large & current app has been running 72+ hours
assets-purge:
	@aws s3 rm s3://$(CDN_HOST) --recursive

assets-upload:
	@aws s3 cp public s3://$(CDN_HOST) --recursive --metadata-directive REPLACE --cache-control "public, max-age=31557600"

build: prep-docker-environment down package-symlinks
	@echo "Building docker images."
	@echo "Grab a coffe and wait."
	@docker-compose build --force-rm
	@echo "Docker images built"

package-symlinks:
	cp -f package.json cypress_e2e/package.json
	cp -f package-lock.json cypress_e2e/package-lock.json

prep-db-build-environment: prep-docker-environment
ifeq ($(RAILS_ENV),)
	@echo "You need to specify a RAILS_ENV (e.g., make db-build RAILS_ENV=test )"
	@echo
	@exit 1
endif
	@echo 'RAILS_ENV = $(RAILS_ENV)'

db-build: prep-db-build-environment
	docker-compose run --rm -e RAILS_ENV=$(RAILS_ENV) web bundle exec rake $(DB_REBUILD) $(DB_ADDL)

db-build-all:
	# make both the test and dev environments
	@make db-build RAILS_ENV=development
	@make db-build RAILS_ENV=test

db-fixtures: RAILS_ENV=test
db-fixtures:
	@# add fixtures to environment (test environment by default)
	@# Override environment with `make db-fixtures RAILS_ENV=env_name`
	@make db-build RAILS_ENV=$(RAILS_ENV) DB_ADDL=db:fixtures:load

db-seed: RAILS_ENV=development
db-seed:
	@# add seeds to environment (development environment by default)
	@# Override environment with `make db-seed RAILS_ENV=env_name`
	@make db-build RAILS_ENV=$(RAILS_ENV) DB_ADDL=db:seed

console: RAILS_ENV=development
console:
	docker-compose run --rm -e RAILS_ENV=$(RAILS_ENV) web bundle exec rails c

psql: RAILS_ENV=development
psql:
	docker-compose run --rm -e RAILS_ENV=$(RAILS_ENV) web /bin/bash -c 'psql -d $$DATABASE_URL'

# cleaning stuff
wipe-volumes:
	@if [[ -n "$$(docker volume ls -qf dangling=true)" ]]; then\
		docker volume rm -f $$(docker volume ls -qf dangling=true);\
  fi
	@docker volume ls -qf dangling=true | xargs -r docker volume rm

wipe-images:
	@if [[ -n "$$(docker images --filter "dangling=true" -q --no-trunc)" ]]; then\
		docker rmi -f $$(docker images --filter "dangling=true" -q --no-trunc);\
	fi
	@if [[ -n "$$(docker images | grep "none" | awk '/ / { print $3 }')" ]]; then\
		docker rmi -f $$(docker images | grep "none" | awk '/ / { print $3 }');\
	fi

wipe-containers:
	@if [[ -n "$$(docker ps -qa --no-trunc --filter "status=exited")" ]]; then\
		docker rm -f $$(docker ps -qa --no-trunc --filter "status=exited");\
	fi

down:
	@docker-compose down
	@docker-compose kill

remove-stopped-containers:
	@docker-compose rm -v

wipe-all: down remove-stopped-containers wipe-volumes wipe-images wipe-containers
