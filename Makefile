VERSION = 1.0.0
IMAGE_NAME = serverless-nodejs
TAG = v$(VERSION)

ifdef DOTENV
	DOTENV_TARGET=dotenv
else
	DOTENV_TARGET=.env
endif

################
# Entry Points #
################

build:
	docker build -f Dockerfile . -t $(IMAGE_NAME)

deploy: $(DOTENV_TARGET)
	docker-compose run --rm serverless make _deps _deploy

remove: $(DOTENV_TARGET)
	docker-compose run --rm serverless make _remove

shell: $(DOTENV_TARGET)
	docker-compose run --rm serverless bash

test: $(DOTENV_TARGET)
	docker-compose run --rm serverless make _deps _test
	
offline: $(DOTENV_TARGET)
	docker-compose run --rm -p 3000:3000 --name offline-sls serverless make _devdeps _offline
	
	
	
##########
# Others #
##########

# Create .env based on .env.template if .env does not exist
.env:
	@echo "Creating .env with .env.template"
	cp .env.template .env

# Create/Overwrite .env with $(DOTENV)
dotenv:
	@echo "Overwrite .env with $(DOTENV)"
	cp $(DOTENV) .env

_deploy:
	rm -fr .serverless
	sls deploy -v
	
_remove:
	sls remove -v
	rm -fr .serverless

_deps:
	rm -fr node_modules
	npm install --production
	
_devdeps:
	npm install
	
_offline:
	sls offline start --host 0.0.0.0
	
_clean:
	rm -fr node_modules .env
	
_test:
	npm test