import { ReactNode, useEffect } from 'react'

import socketManager from 'services/socketManager'
import {
    ServerMessage,
    SocketEventType,
    VoiceCallWrapUpTimeEndedEvent,
} from 'services/socketManager/types'

import PhoneBarContainer from './PhoneBarContainer/PhoneBarContainer'

type Props = {
    children: ReactNode
    clearWrapUpTime: () => void
    callId: number
}

export default function ActiveWrapUpCallBar({
    children,
    clearWrapUpTime,
    callId,
}: Props) {
    useEffect(() => {
        const wrapUpTimeEndedEvent = {
            name: SocketEventType.VoiceCallWrapUpTimeEnded,
            onReceive: (json: ServerMessage) => {
                const eventData =
                    json as unknown as VoiceCallWrapUpTimeEndedEvent
                if (callId === eventData.event.voice_call_id) {
                    clearWrapUpTime()
                }
            },
        }

        socketManager.registerReceivedEvents([wrapUpTimeEndedEvent])

        return () => {
            socketManager.unregisterReceivedEvents([wrapUpTimeEndedEvent])
        }
        // eslint-disable-next-line exhaustive-deps
    }, [])

    return <PhoneBarContainer>{children}</PhoneBarContainer>
}
