dev:
	docker-compose -f docker-compose.dev.yml up

build:	
	docker-compose -f docker-compose.dev.yml up --build

stop:
	docker-compose -f docker-compose.dev.yml down

rebuild:
	docker-compose -f docker-compose.dev.yml up --build --force-recreate

logs:
	docker-compose -f docker-compose.dev.yml logs -f

clean:
	docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans

# Migration Commands

migrate:
	docker-compose -f docker-compose.dev.yml run --rm dbmate up

rollback:
	docker-compose -f docker-compose.dev.yml run --rm dbmate down

status:
	docker-compose -f docker-compose.dev.yml run --rm dbmate status

migrate-new:
	@echo "Enter migration name:" && read name && \
	docker-compose -f docker-compose.dev.yml run --rm dbmate new $$name


DB_USER ?= JayMarkMunda
DB_NAME ?= e_cart
COMPOSE_FILE ?= docker-compose.dev.yml

# Commands
psql:
	docker compose -f $(COMPOSE_FILE) exec db psql -U $(DB_USER) -d $(DB_NAME)

tables:
	docker compose -f $(COMPOSE_FILE) exec db psql -U $(DB_USER) -d $(DB_NAME) -c "\dt"