import React, { useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { TicketChannel } from 'business/types/ticket'
import type { ContactFormAutomationSettings } from 'models/contactForm/types'
import useContactFormAutomationSettings from 'pages/automate/common/hooks/useContactFormAutomationSettings'
import type { SelfServiceStandaloneContactFormChannel } from 'pages/automate/common/hooks/useSelfServiceStandaloneContactFormChannels'

import useAppSelector from '../../../../../hooks/useAppSelector'
import { getHasAutomate } from '../../../../../state/billing/selectors'
import {
    MAX_ACTIVE_FLOWS,
    ORDER_MANAGEMENT,
} from '../../../common/components/constants'
import WorkflowsFeatureList from '../../../common/components/WorkflowsFeatureList'
import { useConnectedChannelsViewContext } from '../ConnectedChannelsViewContext'
import AutomateSubscriptionAction from './AutomateSubscriptionAction'
import ConnectedChannelFeatureToggle from './ConnectedChannelFeatureToggle'

type Props = {
    channel: SelfServiceStandaloneContactFormChannel
}

/**
 * @deprecated This component is outdated and not used anymore. Do not add any new usage of this component.
 * @date 2025-10-02
 * @type automate-deprecation
 */
const ConnectedChannelAccordionBodyStandaloneContactForm = ({
    channel,
}: Props) => {
    const { automationSettings, handleContactFormAutomationSettingsUpdate } =
        useContactFormAutomationSettings(channel.value.id)

    const hasAutomate = useAppSelector(getHasAutomate)

    const {
        workflowsEntrypoints: availableWorkflowsEntrypoints,
        workflowConfigurations,
    } = useConnectedChannelsViewContext()

    const workflowsEntrypoints = useMemo(() => {
        const existingWorkflows: ContactFormAutomationSettings['workflows'] =
            automationSettings?.workflows ?? []

        const existingWorkflowsIds = existingWorkflows.map(({ id }) => id)

        const newWorkflows = availableWorkflowsEntrypoints.filter(
            ({ workflow_id }) => !existingWorkflowsIds.includes(workflow_id),
        )

        return [
            ...existingWorkflows.map(({ id, enabled }) => ({
                workflow_id: id,
                enabled,
            })),
            ...newWorkflows.map(({ workflow_id }) => ({
                workflow_id,
                enabled: false,
            })),
        ]
    }, [automationSettings, availableWorkflowsEntrypoints])

    return (
        <>
            <WorkflowsFeatureList
                configurations={workflowConfigurations}
                allEntrypoints={availableWorkflowsEntrypoints}
                channelType={TicketChannel.ContactForm}
                channelId={`contact-form-${channel.value.id}`}
                integrationId={channel.value.id}
                channelLanguages={[channel.value.default_locale]}
                entrypoints={workflowsEntrypoints}
                maxActiveWorkflows={MAX_ACTIVE_FLOWS}
                limitTooltipMessage="You have reached the maximum number of enabled Flows in this channel. Disable another Flow in order to enable this Flow."
                onChange={(nextEntrypoints) => {
                    logEvent(SegmentEvent.AutomateChannelUpdateFromChannels, {
                        page: 'Channels',
                    })
                    void handleContactFormAutomationSettingsUpdate({
                        workflows: nextEntrypoints.map(
                            ({ workflow_id, enabled }) => ({
                                id: workflow_id,
                                enabled,
                            }),
                        ),
                    })
                }}
            />
            <ConnectedChannelFeatureToggle
                value={automationSettings?.order_management?.enabled ?? false}
                name={ORDER_MANAGEMENT}
                disabled={!hasAutomate}
                onChange={(enabled) => {
                    void handleContactFormAutomationSettingsUpdate({
                        order_management: { enabled },
                    })
                }}
                action={!hasAutomate && <AutomateSubscriptionAction />}
            />
        </>
    )
}

export default ConnectedChannelAccordionBodyStandaloneContactForm
