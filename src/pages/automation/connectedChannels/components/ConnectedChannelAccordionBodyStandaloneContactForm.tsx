import React, {useMemo} from 'react'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {ContactFormAutomationSettings} from 'models/contactForm/types'
import {SelfServiceStandaloneContactFormChannel} from 'pages/automation/common/hooks/useSelfServiceStandaloneContactFormChannels'
import useContactFormsAutomationSettings from 'pages/automation/common/hooks/useContactFormsAutomationSettings'
import {TicketChannel} from 'business/types/ticket'

import {useConnectedChannelsViewContext} from '../ConnectedChannelsViewContext'
import {MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS} from '../../common/components/constants'
import useAppSelector from '../../../../hooks/useAppSelector'
import {getHasAutomationAddOn} from '../../../../state/billing/selectors'
import {FeatureFlagKey} from '../../../../config/featureFlags'
import ConnectedChannelWorkflowsFeature from './ConnectedChannelWorkflowsFeature'
import ConnectedChannelFeatureToggle from './ConnectedChannelFeatureToggle'
import AutomationSubscriptionAction from './AutomationSubscriptionAction'

type Props = {
    channel: SelfServiceStandaloneContactFormChannel
}

const ConnectedChannelAccordionBodyStandaloneContactForm = ({
    channel,
}: Props) => {
    const contactFormOrderManagementEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.ContactFormOrderManagement]

    const {automationSettings, handleContactFormAutomationSettingsUpdate} =
        useContactFormsAutomationSettings(channel.value.id)

    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

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
        <>
            <ConnectedChannelWorkflowsFeature
                channelType={TicketChannel.ContactForm}
                channelId={`contact-form-${channel.value.id}`}
                integrationId={channel.value.id}
                channelLanguages={[channel.value.default_locale]}
                entrypoints={workflowsEntrypoints}
                maxActiveWorkflows={MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS}
                limitTooltipMessage="You have reached the maximum number of enabled flows in this channel. Disable another flow in order to enable this flow."
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

            {contactFormOrderManagementEnabled && (
                <ConnectedChannelFeatureToggle
                    value={
                        automationSettings?.order_management?.enabled ?? false
                    }
                    name="Order management flows"
                    disabled={!hasAutomationAddOn}
                    onChange={(enabled) => {
                        void handleContactFormAutomationSettingsUpdate({
                            order_management: {enabled},
                        })
                    }}
                    action={
                        !hasAutomationAddOn && <AutomationSubscriptionAction />
                    }
                />
            )}
        </>
    )
}

export default ConnectedChannelAccordionBodyStandaloneContactForm
