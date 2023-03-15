import React, {ReactNode, useState} from 'react'

import {SelfServiceChannel} from 'pages/automation/common/hooks/useSelfServiceChannels'

import SelfServicePreviewContainer from './SelfServicePreviewContainer'

type Props<Channel extends SelfServiceChannel> = {
    channels: Channel[]
    alert?: {
        message: ReactNode
        action?: {message: string; href: string}
    }
    children: (channel: Channel) => void
}

const UncontrolledSelfServicePreviewContainer = <
    Channel extends SelfServiceChannel
>({
    children,
    ...props
}: Props<Channel>) => {
    const {channels} = props
    const [channel, setChannel] = useState<Channel | undefined>(channels[0])

    return (
        <SelfServicePreviewContainer
            channel={channel}
            onChange={setChannel}
            {...props}
        >
            {children}
        </SelfServicePreviewContainer>
    )
}

export default UncontrolledSelfServicePreviewContainer
