EDXAPP_IMAGE="fundocker/edxapp:dogwood.3-fun-2.0.0"

# Get local user ids
DOCKER_UID              = $(shell id -u)
DOCKER_GID              = $(shell id -g)

# Docker
COMPOSE          = \
  DOCKER_UID=$(DOCKER_UID) \
  DOCKER_GID=$(DOCKER_GID) \
  EDXAPP_IMAGE=$(EDXAPP_IMAGE) \
  docker-compose -f docker-compose.edx.yml -f docker-compose.cypress.yml -f docker-compose.yml
COMPOSE_RUN      = $(COMPOSE) run --rm -e HOME="/tmp"
WAIT_DB          = $(COMPOSE_RUN) dockerize -wait tcp://edx_mysql:3306 -timeout 60s

# Terminal colors
COLOR_DEFAULT = \033[0;39m
COLOR_ERROR   = \033[0;31m
COLOR_INFO    = \033[0;36m
COLOR_RESET   = \033[0m
COLOR_SUCCESS = \033[0;32m
COLOR_WARNING = \033[0;33m

# Target release expected tree

data/edx/media/.keep:
	mkdir -p data/edx/media
	touch data/edx/media/.keep

data/edx/store/.keep:
	mkdir -p data/edx/store
	touch data/edx/store/.keep

# Make commands

bootstrap: ## bootstrap the project
bootstrap: \
	migrate \
	run
.PHONY: bootstrap

clean:  ## remove temporary data
	rm -rf data/* || exit 0
.PHONY: clean

clean-db: \
  stop
clean-db:  ## remove LMS databases
	$(COMPOSE) rm edx_mongodb edx_mysql edx_redis 
.PHONY: clean-db

logs:  ## get development logs
	$(COMPOSE) logs -f
.PHONY: logs

migrate: \
  tree
migrate:  ## perform database migrations
	@echo "Booting mysql service..."
	$(COMPOSE) up -d edx_mysql
	$(WAIT_DB)
	$(COMPOSE_RUN) edx_lms python manage.py lms migrate
	$(COMPOSE_RUN) edx_lms python /usr/local/bin/auth_init
	$(COMPOSE_RUN) edx_cms python manage.py cms migrate
.PHONY: migrate

run: \
  tree
run:  ## start the service
	$(COMPOSE) up -d
	@echo "Wait for service to be up..."
	$(WAIT_DB)
	$(COMPOSE_RUN) dockerize -wait tcp://edx_redis:6379 -timeout 60s
	$(COMPOSE_RUN) dockerize -wait tcp://graylog:9000 -timeout 60s
	$(COMPOSE_RUN) dockerize -wait tcp://edx_lms:8000 -timeout 60s
	$(COMPOSE_RUN) dockerize -wait tcp://edx_cms:8000 -timeout 60s
.PHONY: run

status: ## alias for "docker-compose ps"
	$(COMPOSE) ps
.PHONY: status

stop:  ## stop the development servers
	$(COMPOSE) stop
.PHONY: stop

down:  ## stop and remove docker containers
	@echo "This will remove the containers and networks related to this project."
	@echo -n "Are you sure to proceed? [y/N] " && read ans && [ $${ans:-N} = y ]
	$(COMPOSE) down
.PHONY: down

test: ## run tests
	$(COMPOSE_RUN) cypress run --config-file false
.PHONY: test

tree: \
	data/edx/media/.keep \
	data/edx/store/.keep
tree:  ## create data directories mounted as volumes
.PHONY: tree

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
.PHONY: help
