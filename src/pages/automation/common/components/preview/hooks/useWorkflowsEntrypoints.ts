import {useMemo} from 'react'
import _keyBy from 'lodash/keyBy'

import {useSelfServicePreviewContext} from '../SelfServicePreviewContext'

const useWorkflowsEntrypoints = () => {
    const {selfServiceConfiguration, workflowsEntrypoints} =
        useSelfServicePreviewContext()

    return useMemo(() => {
        const allWorkflowsEntrypoints =
            selfServiceConfiguration?.workflows_entrypoints ?? []

        if (!workflowsEntrypoints) {
            return allWorkflowsEntrypoints
                .filter((entrypoint) => entrypoint.enabled)
                .map((entrypoint) => ({
                    workflow_id: entrypoint.workflow_id,
                    label: entrypoint.label,
                }))
        }

        const allWorkflowsEntrypointsByWorkflowId = _keyBy(
            allWorkflowsEntrypoints,
            'workflow_id'
        )

        return workflowsEntrypoints
            .filter(
                (entrypoint) =>
                    entrypoint.workflow_id in
                        allWorkflowsEntrypointsByWorkflowId &&
                    entrypoint.enabled
            )
            .map((entrypoint) => ({
                workflow_id: entrypoint.workflow_id,
                label: allWorkflowsEntrypointsByWorkflowId[
                    entrypoint.workflow_id
                ].label,
            }))
    }, [workflowsEntrypoints, selfServiceConfiguration?.workflows_entrypoints])
}

export default useWorkflowsEntrypoints
