import {useCallback, useEffect, useMemo, useState} from 'react'
import _keyBy from 'lodash/keyBy'

import useWorkflowApi from 'pages/automation/workflows/hooks/useWorkflowApi'
import {WorkflowConfigurationShallow} from 'pages/automation/workflows/models/workflowConfiguration.types'

import {useSelfServicePreviewContext} from '../SelfServicePreviewContext'

const useWorkflowsEntrypoints: () => {
    workflow_id: string
    label: string
}[] = () => {
    const {selfServiceConfiguration, workflowsEntrypoints} =
        useSelfServicePreviewContext()
    const {fetchWorkflowConfigurations} = useWorkflowApi()

    const [workflowConfigurationById, setWorkflowConfigurationById] = useState<
        Record<string, WorkflowConfigurationShallow>
    >({})
    const loadWorkflowsConfigurations = useCallback(() => {
        return fetchWorkflowConfigurations().then((confs) =>
            setWorkflowConfigurationById(
                confs.reduce(
                    (acc, conf) => ({
                        ...acc,
                        [conf.id]: conf,
                    }),
                    {} as Record<string, WorkflowConfigurationShallow>
                )
            )
        )
    }, [fetchWorkflowConfigurations])
    useEffect(() => {
        void loadWorkflowsConfigurations()
    }, [loadWorkflowsConfigurations])

    return useMemo(() => {
        const allWorkflowsEntrypoints =
            selfServiceConfiguration?.workflows_entrypoints ?? []

        if (!workflowsEntrypoints) {
            return []
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
                label:
                    workflowConfigurationById[entrypoint.workflow_id]
                        ?.entrypoint?.label ?? '',
            }))
    }, [
        workflowsEntrypoints,
        selfServiceConfiguration?.workflows_entrypoints,
        workflowConfigurationById,
    ])
}

export default useWorkflowsEntrypoints
