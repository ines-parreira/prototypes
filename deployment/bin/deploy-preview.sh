#!/usr/bin/env bash
set -euo pipefail

# deploy-preview-utils.sh is sourced from the toolbox image. Either run this script from that image or
# update this path to the same file in gorgias-ops/docker-images/toolbox/src/deploy-preview-utils.sh
# shellcheck disable=SC1091
. deploy-preview-utils.sh

. "${CI_PROJECT_DIR}/deployment/bin/deploy-utils.sh"

BUILD="${1:-}"
if [ -z "${BUILD}" ]; then
    error "Please provide a build tag"
    exit 1
fi
if [ -z "${BACKEND_REF}" ]; then
    error "Please provide the branch name for the helpdesk backend you want deployed for the preview environment."
    exit 1
fi
if [ -z "${BUILD_DIR}" ]; then
    error "Environment variable BUILD_DIR is required for the location of the build directory."
    exit 1
fi
if [ -z "${ASSETS_DIR}" ]; then
    error "Environment variable ASSETS_DIR is required for the location of the asset directory."
    exit 1
fi
if [ -z "${WEBAPP_PATH}" ]; then
    error "Environment variable WEBAPP_PATH is required for the destination path in GCS."
    exit 1
fi


PREVIEW_IDENTIFIER="f-${BUILD}"
PREVIEW_NS="preview-${PREVIEW_IDENTIFIER}"
PREVIEW_URL="${PREVIEW_IDENTIFIER}.preview.gorgias.xyz"

CONTEXT="gorgias-helpdesk-staging-us-east1-86cc"
STORAGE_BUCKET="gs://gorgias-assets-staging"

DD_DURATION_METRIC="web_app.preview_deployment.duration"

START_TIME="$(date +%s)"

# # Use a function for the exits caused by errors. The condition prevents running this again on regular exit
error_callback() {
  if [ "$1" -ne 0 ]; then
    send_datadog_duration_metric "$DD_DURATION_METRIC" "failed"
    notify_preview_failed "$PREVIEW_NS"
    error "exited with error"
  fi
}

ensure_dependencies

# Send a DataDog custom metric with a failed status tag in case of errors
# We're setting the trap on exit due to "set -e" on the top of the script which will cause an exist in case of an error
trap 'error_callback $?' EXIT

setup_helpdesk_kubecontext "$CONTEXT"

info 'Creating preview environment K8s namespace...'
kubectl --context "$CONTEXT" get ns "$PREVIEW_NS" >/dev/null 2>&1 || kubectl --context="${CONTEXT}" create ns "$PREVIEW_NS"

# Publish manifest before we gzip it for gcs
publish_manifest_configmap "$CONTEXT" "$PREVIEW_NS" "$BUILD_DIR" "/preview/${BUILD}/${WEBAPP_PATH}/build"

# gcloud auth done in gitlab before_script
find_and_publish_to_gcs "$BUILD_DIR" "${STORAGE_BUCKET}/preview/${BUILD}/${WEBAPP_PATH}/build"
find_and_publish_to_gcs "$ASSETS_DIR" "${STORAGE_BUCKET}/preview/${BUILD}/${WEBAPP_PATH}/assets"

deploy_helpdesk_backend_preview "$BACKEND_REF" "$PREVIEW_IDENTIFIER" "$(git show -s --format='%ae' HEAD)" ""

# Everything went fine, send the duration metric with a completed status
send_datadog_duration_metric "$DD_DURATION_METRIC" "completed"

success "\n===================="
success "the helpdesk was deployed to [ https://${PREVIEW_URL} ]."
success "the helpdesk backend was deployed to namespace [${PREVIEW_NS}]."
success "===================="
