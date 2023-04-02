# CICD

This CI/CD workflow is designed to run using GitHub Actions, which automates tasks and helps improve the software development lifecycle. It contains two main jobs, `pr` (Pull Request) and `release`, along with an `agents` job to handle parallelization. This workflow runs on the `push` event for the `main` and `beta` branches and on any `pull_request` event.

## Jobs

### PR (Pull Request) Job

The `pr` job is triggered when a pull request is created or updated. The purpose of this job is to run formatting, linting, testing, and building tasks on the code changes, ensuring that they meet the project's requirements before they can be merged.

This job uses the `nx-cloud-main.yml` workflow, passing in the following parameters:

- `main-branch-name`: The target branch for the pull request
- `number-of-agents`: The number of agents to use for parallel tasks
- `parallel-commands`: Commands to run in parallel, like formatting checks
- `parallel-commands-on-agents`: Commands to run on parallel agents, such as linting, testing, and building tasks
- `final-commands`: Commands to run after all parallel tasks have completed, like testing

- The `pr` job also includes the `CODECOV_TOKEN` secret, which is required for uploading code coverage reports to Codecov.

### Release Job

The `release` job is triggered when a pull request is merged or when there's a push event to the `main` or `beta` branches. This job is responsible for running the same formatting, linting, testing, and building tasks as the `pr` job. Additionally, it runs the `semantic-release` task, which automates versioning and publishing the package.

This job uses the `nx-cloud-main.yml` workflow, passing in the same parameters as the `pr` job, with the addition of the `semantic-release` command in the `final-commands` section.

The release job includes the NPM_TOKEN, GITHUB_TOKEN, and CODECOV_TOKEN secrets, which are required for publishing the package to npm, interacting with the GitHub API, and uploading code coverage reports to Codecov, respectively.

### Agents Job

The `agents` job is defined in the `nx-cloud-agents.yml` workflow and is used to run tasks in parallel using multiple agents. It receives the `number-of-agents` parameter, which determines how many agents to use for parallel tasks. This job is responsible for improving the overall performance of the CI/CD workflow.

### Concurrency

The `concurrency` field in the workflow ensures that only one instance of the workflow runs at a time for a given pull request or branch. If a new instance is triggered, the in-progress instance will be canceled, saving resources and ensuring that the most recent changes are tested.

### Permissions

The `permissions` field defines the GitHub permissions needed for the workflow. It includes `pull-requests`, `issues`, and `contents` permissions with the `write` access level, allowing the workflow to interact with these resources.

In summary, this CI/CD workflow automates the process of running formatting, linting, testing, and building tasks for each pull request and push event, ensuring code quality and consistency throughout the project. The workflow also automates package versioning and publishing, streamlining the release process.
