import React, {useMemo} from 'react'
import {useAsyncFn} from 'react-use'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import {HelpCenterAutomationSettings} from 'models/helpCenter/types'
import useHelpCentersAutomationSettings from 'pages/automation/common/hooks/useHelpCenterAutomationSettings'
import {SelfServiceHelpCenterChannel} from 'pages/automation/common/hooks/useSelfServiceHelpCenterChannels'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {helpCenterUpdated} from 'state/entities/helpCenter/helpCenters/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {TicketChannel} from 'business/types/ticket'

import {useConnectedChannelsViewContext} from '../ConnectedChannelsViewContext'
import {MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS} from '../../common/components/constants'
import ConnectedChannelFeatureToggle from './ConnectedChannelFeatureToggle'
import AutomationSubscriptionAction from './AutomationSubscriptionAction'
import ConnectedChannelWorkflowsFeature from './ConnectedChannelWorkflowsFeature'

type Props = {
    channel: SelfServiceHelpCenterChannel
}

const ConnectedChannelAccordionBodyHelpCenter = ({channel}: Props) => {
    const {client} = useHelpCenterApi()
    const dispatch = useAppDispatch()
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    const helpCenterAndContactFormFlowsEnabled =
        useFlags()[FeatureFlagKey.HelpCenterAndContactFormFlows]

    const {automationSettings, handleHelpCenterAutomationSettingsUpdate} =
        useHelpCentersAutomationSettings(channel.value.id)

    const {workflowsEntrypoints: availableWorkflowsEntrypoints} =
        useConnectedChannelsViewContext()

    const workflowsEntrypoints = useMemo(() => {
        const availableWorkflowsIds = availableWorkflowsEntrypoints.map(
            ({workflow_id}) => workflow_id
        )
        const existingWorkflows: HelpCenterAutomationSettings['workflows'] = (
            automationSettings?.workflows ?? []
        ).filter(({id}) => availableWorkflowsIds.includes(id))

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

    const [{loading: updatingHelpCenter}, updateHelpCenter] = useAsyncFn(
        async (orderManagementEnabled: boolean) => {
            if (client) {
                try {
                    const {data} = await client.updateHelpCenter(
                        {
                            help_center_id: channel.value.id,
                        },
                        {
                            self_service_deactivated: !orderManagementEnabled,
                        }
                    )

                    dispatch(helpCenterUpdated(data))

                    void dispatch(
                        notify({
                            message: 'Successfully updated',
                            status: NotificationStatus.Success,
                        })
                    )
                } catch (err) {
                    void dispatch(
                        notify({
                            message: 'Failed to update',
                            status: NotificationStatus.Error,
                        })
                    )
                }
            }
        },
        [client, channel]
    )

    return (
        <>
            {helpCenterAndContactFormFlowsEnabled && (
                <ConnectedChannelWorkflowsFeature
                    channelType={TicketChannel.HelpCenter}
                    channelId={`contact-form-${channel.value.id}`}
                    integrationId={channel.value.id}
                    channelLanguages={channel.value.supported_locales}
                    maxActiveWorkflows={MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS}
                    entrypoints={workflowsEntrypoints}
                    limitTooltipMessage="You have reached the maximum number of enabled flows in this channel. Disable another flow in order to enable this flow."
                    onChange={(nextEntrypoints) => {
                        void handleHelpCenterAutomationSettingsUpdate({
                            workflows: nextEntrypoints.map(
                                ({workflow_id, enabled}) => ({
                                    id: workflow_id,
                                    enabled,
                                })
                            ),
                        })
                    }}
                />
            )}

            <ConnectedChannelFeatureToggle
                name="Order management flows"
                value={channel.value.self_service_deactivated_datetime === null}
                disabled={updatingHelpCenter || !hasAutomationAddOn}
                onChange={updateHelpCenter}
                action={!hasAutomationAddOn && <AutomationSubscriptionAction />}
            />
        </>
    )
}

export default ConnectedChannelAccordionBodyHelpCenter
