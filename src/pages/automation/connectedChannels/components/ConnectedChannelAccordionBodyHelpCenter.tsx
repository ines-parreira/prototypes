import React from 'react'
import {useAsyncFn} from 'react-use'

import useAppDispatch from 'hooks/useAppDispatch'
import {SelfServiceHelpCenterChannel} from 'pages/automation/common/hooks/useSelfServiceHelpCenterChannels'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {helpCenterUpdated} from 'state/entities/helpCenter/helpCenters/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import ConnectedChannelFeatureToggle from './ConnectedChannelFeatureToggle'

import css from './ConnectedChannelAccordionItem.less'

type Props = {
    channel: SelfServiceHelpCenterChannel
}

const ConnectedChannelAccordionBodyHelpCenter = ({channel}: Props) => {
    const {client} = useHelpCenterApi()
    const dispatch = useAppDispatch()

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
        <div className={css.featureList}>
            <ConnectedChannelFeatureToggle
                name="Order management"
                value={channel.value.self_service_deactivated_datetime === null}
                disabled={updatingHelpCenter}
                onChange={updateHelpCenter}
            />
        </div>
    )
}

export default ConnectedChannelAccordionBodyHelpCenter
