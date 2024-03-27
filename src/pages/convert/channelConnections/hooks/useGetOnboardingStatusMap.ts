import {useMemo} from 'react'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {useListChannelConnections} from 'models/convert/channelConnection/queries'
import {ChannelConnectionChannel} from 'models/convert/channelConnection/types'

export const useGetOnboardingStatusMap = () => {
    const isSubscriber = useIsConvertSubscriber()

    const {data: channelConnections, isLoading} = useListChannelConnections({
        channel: ChannelConnectionChannel.Widget,
    })

    const onboardingMap = useMemo(() => {
        const map: {[key: string]: boolean} = {}
        if (!!channelConnections && Array.isArray(channelConnections)) {
            channelConnections.map((channelConnection) => {
                if (!!channelConnection.external_id) {
                    map[channelConnection.external_id] = Boolean(
                        (isSubscriber && channelConnection.is_onboarded) ||
                            (!isSubscriber && channelConnection.is_setup)
                    )
                }
            })
        }
        return map
    }, [isSubscriber, channelConnections])

    return {onboardingMap, isLoading}
}
