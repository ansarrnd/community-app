# Portable CI/CD — works on Linux, macOS, and GitHub Actions
.PHONY: ci ci-security ci-quality ci-test ci-build ci-e2e ci-deploy ci-local ci-cloud ci-list install-ci

CI := ./ci/run.sh

ci:
	$(CI)

ci-security:
	$(CI) security

ci-quality:
	$(CI) quality

ci-test:
	$(CI) test

ci-build:
	$(CI) build

ci-e2e:
	$(CI) e2e

ci-deploy:
	$(CI) deploy

ci-local:
	CI_EXECUTION_MODE=local $(CI)

ci-cloud:
	CI_EXECUTION_MODE=cloud $(CI)

ci-list:
	$(CI) --list

install-ci:
	chmod +x ci/run.sh ci/lib/runner.sh ci/tools/install-deps.sh
	./ci/tools/install-deps.sh

# Full lifecycle pipeline
ci-full:
	$(CI) validate security quality test build

# Stack-specific shortcuts
ci-rn:
	$(CI) --stack react-native

ci-flutter:
	$(CI) --stack flutter

ci-kmp:
	$(CI) --stack kmp

ci-cmp:
	$(CI) --stack cmp
