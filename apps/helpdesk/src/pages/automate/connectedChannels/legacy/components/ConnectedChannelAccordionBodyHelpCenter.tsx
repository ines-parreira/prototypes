import React, { useMemo } from 'react'

import { useAsyncFn } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useParams } from 'react-router-dom'

import { TicketChannel } from 'business/types/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { HelpCenterAutomationSettings } from 'models/helpCenter/types'
import { IntegrationType } from 'models/integration/constants'
import useHelpCentersAutomationSettings from 'pages/automate/common/hooks/useHelpCenterAutomationSettings'
import type { SelfServiceHelpCenterChannel } from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { getHasAutomate } from 'state/billing/selectors'
import { helpCenterUpdated } from 'state/entities/helpCenter/helpCenters/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import {
    MAX_ACTIVE_FLOWS,
    ORDER_MANAGEMENT,
} from '../../../common/components/constants'
import WorkflowsFeatureList from '../../../common/components/WorkflowsFeatureList'
import { useConnectedChannelsViewContext } from '../ConnectedChannelsViewContext'
import AutomateSubscriptionAction from './AutomateSubscriptionAction'
import ConnectedChannelFeatureToggle from './ConnectedChannelFeatureToggle'

type Props = {
    channel: SelfServiceHelpCenterChannel
}

/**
 * @deprecated This component is outdated and not used anymore. Do not add any new usage of this component.
 * @date 2025-10-02
 * @type automate-deprecation
 */
const ConnectedChannelAccordionBodyHelpCenter = ({ channel }: Props) => {
    const { client } = useHelpCenterApi()
    const dispatch = useAppDispatch()
    const hasAutomate = useAppSelector(getHasAutomate)
    const { shopType } = useParams<{
        shopType: string
    }>()

    const { automationSettings, handleHelpCenterAutomationSettingsUpdate } =
        useHelpCentersAutomationSettings(channel.value.id)

    const {
        workflowsEntrypoints: availableWorkflowsEntrypoints,
        workflowConfigurations: configurations,
    } = useConnectedChannelsViewContext()

    const workflowsEntrypoints = useMemo(() => {
        const availableWorkflowsIds = availableWorkflowsEntrypoints.map(
            ({ workflow_id }) => workflow_id,
        )
        const existingWorkflows: HelpCenterAutomationSettings['workflows'] = (
            automationSettings?.workflows ?? []
        ).filter(({ id }) => availableWorkflowsIds.includes(id))

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

    const [{ loading: updatingHelpCenter }, updateHelpCenter] = useAsyncFn(
        async (orderManagementEnabled: boolean) => {
            if (client) {
                try {
                    const { data } = await client.updateHelpCenter(
                        {
                            help_center_id: channel.value.id,
                        },
                        {
                            self_service_deactivated: !orderManagementEnabled,
                        },
                    )

                    dispatch(helpCenterUpdated(data))

                    void dispatch(
                        notify({
                            message: 'Successfully updated',
                            status: NotificationStatus.Success,
                        }),
                    )
                } catch {
                    void dispatch(
                        notify({
                            message: 'Failed to update',
                            status: NotificationStatus.Error,
                        }),
                    )
                }
            }
        },
        [client, channel],
    )

    return (
        <>
            <WorkflowsFeatureList
                channelType={TicketChannel.HelpCenter}
                configurations={configurations}
                allEntrypoints={availableWorkflowsEntrypoints}
                channelId={`contact-form-${channel.value.id}`}
                integrationId={channel.value.id}
                channelLanguages={channel.value.supported_locales}
                maxActiveWorkflows={MAX_ACTIVE_FLOWS}
                entrypoints={workflowsEntrypoints}
                limitTooltipMessage="You have reached the maximum number of enabled Flows in this channel. Disable another Flow in order to enable this Flow."
                onChange={(nextEntrypoints) => {
                    logEvent(SegmentEvent.AutomateChannelUpdateFromChannels, {
                        page: 'Channels',
                    })
                    void handleHelpCenterAutomationSettingsUpdate({
                        workflows: nextEntrypoints.map(
                            ({ workflow_id, enabled }) => ({
                                id: workflow_id,
                                enabled,
                            }),
                        ),
                    })
                }}
            />

            {shopType === IntegrationType.Shopify && (
                <ConnectedChannelFeatureToggle
                    name={ORDER_MANAGEMENT}
                    value={
                        channel.value.self_service_deactivated_datetime === null
                    }
                    disabled={updatingHelpCenter || !hasAutomate}
                    onChange={updateHelpCenter}
                    action={!hasAutomate && <AutomateSubscriptionAction />}
                />
            )}
        </>
    )
}

export default ConnectedChannelAccordionBodyHelpCenter
