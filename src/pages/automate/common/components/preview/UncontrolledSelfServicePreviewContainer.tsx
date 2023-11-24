import React, {ReactNode, useState} from 'react'

import {SelfServiceChannel} from 'pages/automate/common/hooks/useSelfServiceChannels'

import SelfServicePreviewContainer from './SelfServicePreviewContainer'

type Props<T extends SelfServiceChannel> = {
    channels: T[]
    alert?: {
        message: ReactNode
        action?: {message: string; href: string}
    }
    children: (channel: T) => void
}

const UncontrolledSelfServicePreviewContainer = <T extends SelfServiceChannel>({
    children,
    ...props
}: Props<T>) => {
    const {channels} = props
    const [channel, setChannel] = useState<T | undefined>(channels[0])

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
