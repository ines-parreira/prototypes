# Common functions for frontend deployments

find_and_publish_to_gcs() {
  local directory="$1"
  local storage_path="$2"
  local tmp_dir=$(mktemp -d)
  local source_dir="${tmp_dir}/$(basename ${directory})"
  cp -r "$directory" "$tmp_dir"
  find "$source_dir" -type f -exec gzip "{}" \; -exec mv "{}.gz" "{}" \;
  gsutil -h Content-Encoding:gzip -m -q rsync -R "$source_dir" "$storage_path"
}

publish_manifest_configmap() {
  local context="$1"
  local namespace="$2"
  local build_dir="$3"
  local webapp_path="$4"
  echo -n "$webapp_path" > GORGIAS_WEBAPP_BUILD_PATH
  kubectl --context "$context" -n "$namespace" create configmap frontend-manifest \
    "--from-file=${build_dir}/manifest.json" \
    --from-file=GORGIAS_WEBAPP_BUILD_PATH \
    --dry-run=client -o yaml | kubectl --context "$context" -n "$namespace" apply -f -
}
