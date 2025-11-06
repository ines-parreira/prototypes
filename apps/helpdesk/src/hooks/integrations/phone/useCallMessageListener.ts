import { useEffect, useRef } from 'react'

import { Call } from '@twilio/voice-sdk'

import { TwilioMessage } from 'models/voiceCall/twilioMessageTypes'

export function useCallMessageListener(
    call: Call,
    onMessage: (twilioMessage: TwilioMessage) => void,
) {
    const onMessageRef = useRef(onMessage)

    useEffect(() => {
        onMessageRef.current = onMessage
    }, [onMessage])

    useEffect(() => {
        const handleMessage = (message: any) => {
            const twilioMessage = message.content as TwilioMessage
            onMessageRef.current(twilioMessage)
        }

        call.on('messageReceived', handleMessage)

        return () => {
            call.off('messageReceived', handleMessage)
        }
    }, [call])
}
