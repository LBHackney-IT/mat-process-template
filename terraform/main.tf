provider "aws" {
  region  = "eu-west-2"
  version = "~> 2.0"
}

provider "template" {
  version = "~> 2.0"
}

terraform {
  backend "s3" {
    bucket  = "hackney-mat-state-storage-s3"
    encrypt = true
    region  = "eu-west-2"
    key     = "services/TODO/state"
  }
}

data "aws_iam_role" "ec2_container_service_role" {
  name = "ecsServiceRole"
}

data "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  parameter_store = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter"
}

module "development" {
  # We pin to `master` for now, until we have tagged releases of the modules.
  source = "github.com/LBHackney-IT/aws-mat-components-per-service-terraform.git//modules/environment/frontend?ref=master"

  environment_name = "development"
  application_name = "TODO"

  security_group_name_prefix = "mat-frontend-sg"
  lb_prefix                  = "hackney-ext-mat-alb"

  # Note that this process should only use ports in the 200X range to avoid port
  # clashes.
  port = 2001

  listener_port = 80
  path_pattern  = "/TODO*"

  desired_number_of_ec2_nodes = 2

  ecs_execution_role = "${data.aws_iam_role.ecs_task_execution_role.arn}"
  lb_iam_role_arn    = "${data.aws_iam_role.ec2_container_service_role.arn}"

  task_definition_environment_variables = {
    PROCESS_TYPE_VALUE = "TODO"
    PROCESS_TYPE_NAME  = "TODO"

    PROCESS_API_HOST     = "4cgb2c6pqe.execute-api.eu-west-2.amazonaws.com"
    PROCESS_API_BASE_URL = "/development/mat-process/api"

    MAT_API_HOST     = "g6bw0g0ojk.execute-api.eu-west-2.amazonaws.com"
    MAT_API_BASE_URL = "/development/manage-a-tenancy-api"
  }

  task_definition_environment_variable_count = 6

  task_definition_secrets = {
    PROCESS_API_JWT_SECRET  = "${local.parameter_store}/development-TODO-PROCESS_API_JWT_SECRET"
    PROCESS_API_KEY         = "${local.parameter_store}/development-TODO-PROCESS_API_KEY"
    MAT_API_JWT_SECRET      = "${local.parameter_store}/development-TODO-MAT_API_JWT_SECRET"
    MAT_API_DATA_SHARED_KEY = "${local.parameter_store}/development-TODO-MAT_API_DATA_SHARED_KEY"
    MAT_API_DATA_SALT       = "${local.parameter_store}/development-TODO-MAT_API_DATA_SALT"
    MAT_API_DATA_ITERATIONS = "${local.parameter_store}/development-TODO-MAT_API_DATA_ITERATIONS"
    MAT_API_DATA_KEY_SIZE   = "${local.parameter_store}/development-TODO-MAT_API_DATA_KEY_SIZE"
    MAT_API_DATA_ALGORITHM  = "${local.parameter_store}/development-TODO-MAT_API_DATA_ALGORITHM"
    MAT_API_DATA_IV         = "${local.parameter_store}/development-TODO-MAT_API_DATA_IV"
  }

  task_definition_secret_count = 9
}

module "staging" {
  # We pin to `master` for now, until we have tagged releases of the modules.
  source = "github.com/LBHackney-IT/aws-mat-components-per-service-terraform.git//modules/environment/frontend?ref=master"

  environment_name = "staging"
  application_name = "TODO"

  security_group_name_prefix = "mat-frontend-sg"
  lb_prefix                  = "hackney-ext-mat-alb"

  # Note that this process should only use ports in the 200X range to avoid port
  # clashes.
  port = 2002

  listener_port = 80
  path_pattern  = "/TODO*"

  desired_number_of_ec2_nodes = 2

  ecs_execution_role = "${data.aws_iam_role.ecs_task_execution_role.arn}"
  lb_iam_role_arn    = "${data.aws_iam_role.ec2_container_service_role.arn}"

  task_definition_environment_variables = {
    PROCESS_TYPE_VALUE = "TODO"
    PROCESS_TYPE_NAME  = "TODO"

    PROCESS_API_HOST     = "dg5hz8mgwc.execute-api.eu-west-2.amazonaws.com"
    PROCESS_API_BASE_URL = "/staging/mat-process/api"

    MAT_API_HOST     = "g6bw0g0ojk.execute-api.eu-west-2.amazonaws.com"
    MAT_API_BASE_URL = "/staging/manage-a-tenancy-api"
  }

  task_definition_environment_variable_count = 6

  task_definition_secrets = {
    PROCESS_API_JWT_SECRET  = "${local.parameter_store}/staging-TODO-PROCESS_API_JWT_SECRET"
    PROCESS_API_KEY         = "${local.parameter_store}/staging-TODO-PROCESS_API_KEY"
    MAT_API_JWT_SECRET      = "${local.parameter_store}/staging-TODO-MAT_API_JWT_SECRET"
    MAT_API_DATA_SHARED_KEY = "${local.parameter_store}/staging-TODO-MAT_API_DATA_SHARED_KEY"
    MAT_API_DATA_SALT       = "${local.parameter_store}/staging-TODO-MAT_API_DATA_SALT"
    MAT_API_DATA_ITERATIONS = "${local.parameter_store}/staging-TODO-MAT_API_DATA_ITERATIONS"
    MAT_API_DATA_KEY_SIZE   = "${local.parameter_store}/staging-TODO-MAT_API_DATA_KEY_SIZE"
    MAT_API_DATA_ALGORITHM  = "${local.parameter_store}/staging-TODO-MAT_API_DATA_ALGORITHM"
    MAT_API_DATA_IV         = "${local.parameter_store}/staging-TODO-MAT_API_DATA_IV"
  }

  task_definition_secret_count = 9
}

module "production" {
  # We pin to `master` for now, until we have tagged releases of the modules.
  source = "github.com/LBHackney-IT/aws-mat-components-per-service-terraform.git//modules/environment/frontend?ref=master"

  environment_name = "production"
  application_name = "TODO"

  security_group_name_prefix = "mat-frontend-sg"
  lb_prefix                  = "hackney-ext-mat-alb"

  # Note that this process should only use ports in the 200X range to avoid port
  # clashes.
  port = 2000

  listener_port = 80
  path_pattern  = "/TODO*"

  desired_number_of_ec2_nodes = 2

  ecs_execution_role = "${data.aws_iam_role.ecs_task_execution_role.arn}"
  lb_iam_role_arn    = "${data.aws_iam_role.ec2_container_service_role.arn}"

  task_definition_environment_variables = {
    PROCESS_TYPE_VALUE = "TODO"
    PROCESS_TYPE_NAME  = "TODO"

    PROCESS_API_HOST     = "n74li4pi4k.execute-api.eu-west-2.amazonaws.com"
    PROCESS_API_BASE_URL = "/production/mat-process/api"

    MAT_API_HOST     = "g6bw0g0ojk.execute-api.eu-west-2.amazonaws.com"
    MAT_API_BASE_URL = "/production/manage-a-tenancy-api"
  }

  task_definition_environment_variable_count = 6

  task_definition_secrets = {
    PROCESS_API_JWT_SECRET  = "${local.parameter_store}/production-TODO-PROCESS_API_JWT_SECRET"
    PROCESS_API_KEY         = "${local.parameter_store}/production-TODO-PROCESS_API_KEY"
    MAT_API_JWT_SECRET      = "${local.parameter_store}/production-TODO-MAT_API_JWT_SECRET"
    MAT_API_DATA_SHARED_KEY = "${local.parameter_store}/production-TODO-MAT_API_DATA_SHARED_KEY"
    MAT_API_DATA_SALT       = "${local.parameter_store}/production-TODO-MAT_API_DATA_SALT"
    MAT_API_DATA_ITERATIONS = "${local.parameter_store}/production-TODO-MAT_API_DATA_ITERATIONS"
    MAT_API_DATA_KEY_SIZE   = "${local.parameter_store}/production-TODO-MAT_API_DATA_KEY_SIZE"
    MAT_API_DATA_ALGORITHM  = "${local.parameter_store}/production-TODO-MAT_API_DATA_ALGORITHM"
    MAT_API_DATA_IV         = "${local.parameter_store}/production-TODO-MAT_API_DATA_IV"
  }

  task_definition_secret_count = 9
}
