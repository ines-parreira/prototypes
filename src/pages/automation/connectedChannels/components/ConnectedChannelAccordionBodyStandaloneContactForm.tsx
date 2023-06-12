import React, {useMemo} from 'react'

import {ContactFormAutomationSettings} from 'models/contactForm/types'
import {SelfServiceStandaloneContactFormChannel} from 'pages/automation/common/hooks/useSelfServiceStandaloneContactFormChannels'
import useContactFormsAutomationSettings from 'pages/automation/common/hooks/useContactFormsAutomationSettings'
import {useConnectedChannelsViewContext} from '../ConnectedChannelsViewContext'
import ConnectedChannelWorkflowsFeature from './ConnectedChannelWorkflowsFeature'

type Props = {
    channel: SelfServiceStandaloneContactFormChannel
}

const ConnectedChannelAccordionBodyStandaloneContactForm = ({
    channel,
}: Props) => {
    const {automationSettings, handleContactFormAutomationSettingsUpdate} =
        useContactFormsAutomationSettings(channel.value.id)

    const {workflowsEntrypoints: availableWorkflowsEntrypoints} =
        useConnectedChannelsViewContext()

    const workflowsEntrypoints = useMemo(() => {
        const existingWorkflows: ContactFormAutomationSettings['workflows'] =
            automationSettings?.workflows ?? []

        const existingWorkflowsIds = existingWorkflows.map(({id}) => id)

        const newWorkflows = availableWorkflowsEntrypoints.filter(
            ({workflow_id}) => !existingWorkflowsIds.includes(workflow_id)
        )

        return [
            ...existingWorkflows.map(({id, enabled}) => ({
                workflow_id: id,
                enabled,
            })),
            ...newWorkflows.map(({workflow_id}) => ({
                workflow_id,
                enabled: false,
            })),
        ]
    }, [automationSettings, availableWorkflowsEntrypoints])

    return (
        <ConnectedChannelWorkflowsFeature
            channelId={`contact-form-${channel.value.id}`}
            entrypoints={workflowsEntrypoints}
            onChange={(nextEntrypoints) => {
                void handleContactFormAutomationSettingsUpdate({
                    workflows: nextEntrypoints.map(
                        ({workflow_id, enabled}) => ({
                            id: workflow_id,
                            enabled,
                        })
                    ),
                })
            }}
        />
    )
}

export default ConnectedChannelAccordionBodyStandaloneContactForm
