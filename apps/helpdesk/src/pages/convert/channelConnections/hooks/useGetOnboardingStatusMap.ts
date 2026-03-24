import { useMemo } from 'react'

import { reportError } from '@repo/logging'

import useAppDispatch from 'hooks/useAppDispatch'
import { useListChannelConnections } from 'models/convert/channelConnection/queries'
import { ChannelConnectionChannel } from 'models/convert/channelConnection/types'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useGetOnboardingStatusMap = () => {
    const dispatch = useAppDispatch()
    const isSubscriber = useIsConvertSubscriber()

    const {
        data: channelConnections,
        isLoading,
        isError,
    } = useListChannelConnections(
        {
            channel: ChannelConnectionChannel.Widget,
        },
        {
            onError: (error) => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'Something went wrong while fetching your Convert campaigns.',
                    }),
                )
                reportError(error, {
                    tags: {
                        section: 'convert',
                        team: 'convert',
                    },
                })
            },
        },
    )

    const onboardingMap = useMemo(() => {
        const map: { [key: string]: boolean } = {}
        if (!!channelConnections && Array.isArray(channelConnections)) {
            channelConnections.map((channelConnection) => {
                if (!!channelConnection.external_id) {
                    map[channelConnection.external_id] = Boolean(
                        (isSubscriber && channelConnection.is_onboarded) ||
                            (!isSubscriber && channelConnection.is_setup),
                    )
                }
            })
        }
        return map
    }, [isSubscriber, channelConnections])

    return { onboardingMap, isLoading, isError }
}
