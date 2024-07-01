import {useMemo} from 'react'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {ChannelLanguage} from 'pages/automate/common/types'
import {Entrypoint} from 'pages/automate/common/components/WorkflowsFeatureList'
import {useGetWorkflowConfigurations} from 'models/workflows/queries'

export const useHelpCenterFlows = ({
    shopType,
    shopName,
    supportedLocales,
    flows,
}: {
    shopName: string
    shopType: string
    supportedLocales: ChannelLanguage[]
    flows: Entrypoint[]
}) => {
    const {
        isLoading: isWorkflowsFetchPending,
        data: workflowConfigurations = [],
    } = useGetWorkflowConfigurations()

    const {
        isFetchPending: isSelfServiceConfigurationPending,
        selfServiceConfiguration,
        storeIntegration,
    } = useSelfServiceConfiguration(shopType, shopName)

    // Filter flows not supported by help center
    const supportedWorkflowConfigurations = workflowConfigurations.filter(
        (config) =>
            config.available_languages.some((lang) =>
                supportedLocales.includes(lang)
            ) && !config.is_draft
    )

    const availableWorkflowsEntrypoints = useMemo(
        () =>
            // Filter entrypoints not supported or filtered
            selfServiceConfiguration?.workflows_entrypoints?.filter(
                (sspConfig) =>
                    supportedWorkflowConfigurations.find(
                        (workflowConfig) =>
                            workflowConfig.id === sspConfig.workflow_id
                    )
            ) ?? [],
        [
            selfServiceConfiguration?.workflows_entrypoints,
            supportedWorkflowConfigurations,
        ]
    )

    const workflowsEntrypoints = useMemo(() => {
        const availableWorkflowsIds = availableWorkflowsEntrypoints.map(
            ({workflow_id}) => workflow_id
        )
        const existingWorkflows = flows.filter(({workflow_id}) =>
            availableWorkflowsIds.includes(workflow_id)
        )

        const existingWorkflowsIds = existingWorkflows.map(
            ({workflow_id}) => workflow_id
        )

        const newWorkflows = availableWorkflowsEntrypoints.filter(
            ({workflow_id}) => !existingWorkflowsIds.includes(workflow_id)
        )

        return [
            ...existingWorkflows.map(({workflow_id, enabled}) => ({
                workflow_id,
                enabled,
            })),
            ...newWorkflows.map(({workflow_id}) => ({
                workflow_id,
                enabled: false,
            })),
        ]
    }, [flows, availableWorkflowsEntrypoints])
    const enabledFlows = useMemo(() => {
        const enabledWorkflowsIds = workflowsEntrypoints
            .filter((entrypoint) => entrypoint.enabled)
            .map((entrypoint) => entrypoint.workflow_id)

        return workflowConfigurations
            .filter((workflowConfiguration) =>
                enabledWorkflowsIds.includes(workflowConfiguration.id)
            )
            .map((workflowConfiguration) => ({
                name: workflowConfiguration.name,
                id: workflowConfiguration.id,
            }))
    }, [workflowConfigurations, workflowsEntrypoints])

    return {
        entrypoints: availableWorkflowsEntrypoints,
        isLoading: isWorkflowsFetchPending || isSelfServiceConfigurationPending,
        workflowConfigurations: supportedWorkflowConfigurations,
        storeIntegration,
        workflowsEntrypoints,
        selfServiceConfiguration,
        enabledFlows,
    }
}
