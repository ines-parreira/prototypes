import { useMemo } from 'react'

import _ from 'lodash'
import { useParams } from 'react-router-dom'

import { SelfServiceChannelType } from 'pages/automate/common/hooks/useSelfServiceChannels'
import useWorkflowChannelSupport from 'pages/automate/workflows/hooks/useWorkflowChannelSupport'
import { WorkflowConfiguration } from 'pages/automate/workflows/models/workflowConfiguration.types'

const useOnlySupportedChannels = (
    configuration: WorkflowConfiguration,
    channelType: SelfServiceChannelType,
) => {
    const { shopType, shopName } = useParams<{
        shopType: string
        shopName: string
    }>()
    const { getUnsupportedNodeTypes, getSupportedChannels } =
        useWorkflowChannelSupport(shopType, shopName)
    const onlySupportedChannels = useMemo(() => {
        const unsupportedNodeTypes = getUnsupportedNodeTypes(
            channelType,
            configuration,
        )

        const onlySupportedChannels = _.uniq(
            unsupportedNodeTypes.reduce<SelfServiceChannelType[]>(
                (acc, nodeType) => [...acc, ...getSupportedChannels(nodeType)],
                [],
            ),
        )
        return onlySupportedChannels
    }, [
        channelType,
        configuration,
        getSupportedChannels,
        getUnsupportedNodeTypes,
    ])
    return onlySupportedChannels
}

export default useOnlySupportedChannels
