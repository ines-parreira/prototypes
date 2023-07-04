import React from 'react'
import {
    getChannelName,
    useWorkflowChannelSupportContext,
} from 'pages/automation/workflows/hooks/useWorkflowChannelSupport'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {VisualBuilderNode} from 'pages/automation/workflows/models/visualBuilderGraph.types'

export default function SupportedChannelsWarning({
    nodeType,
}: {
    nodeType: VisualBuilderNode['type']
}) {
    const {getSupportedChannels, getUnsupportedChannels} =
        useWorkflowChannelSupportContext()
    const supportedChannels = getSupportedChannels(nodeType).map(getChannelName)
    const unsupportedChannels =
        getUnsupportedChannels(nodeType).map(getChannelName)
    return (
        <>
            {unsupportedChannels.length > 0 && (
                <Alert type={AlertType.Warning} icon={AlertType.Warning}>
                    This step is currently only supported for flows in{' '}
                    {supportedChannels.join(' and ')}. Using this step will
                    prevent this flow from being enabled in{' '}
                    {unsupportedChannels.join(' and ')}.
                </Alert>
            )}
        </>
    )
}
