import { useCallback, useEffect, useState } from 'react'

import moment from 'moment'

import { useEndWrapUpTime } from '@gorgias/api-queries'

import useInterval from 'hooks/useInterval'
import { useNotify } from 'hooks/useNotify'
import { VoiceCall } from 'models/voiceCall/types'
import socketManager from 'services/socketManager'
import {
    ServerMessage,
    SocketEventType,
    VoiceCallWrapUpTimeStartedEvent,
} from 'services/socketManager/types'

export default function useWrapUpTime() {
    const [wrapUpEndTimestamp, setWrapUpEndTimestamp] = useState<string | null>(
        null,
    )
    const [voiceCall, setVoiceCall] = useState<VoiceCall | null>(null)
    const [timeLeft, setTimeLeft] = useState<string | null>(null)
    const notify = useNotify()

    const clearWrapUpTime = () => {
        setWrapUpEndTimestamp(null)
        setTimeLeft(null)
        setVoiceCall(null)
    }

    const endWrapUpTimeMutation = useEndWrapUpTime({
        mutation: {
            onSuccess: () => {
                clearWrapUpTime()
            },
            onError: () => {
                notify.error('Failed to end wrap-up time')
            },
        },
    })

    const handleWrapUpTimeStarted = useCallback(
        (json: ServerMessage) => {
            const eventData = json as unknown as VoiceCallWrapUpTimeStartedEvent
            setWrapUpEndTimestamp(eventData.event.expiration_datetime)
            setVoiceCall(eventData.voice_call)
        },
        [setWrapUpEndTimestamp],
    )

    useInterval(() => {
        if (!wrapUpEndTimestamp) {
            return
        }

        const wrapUpMoment = moment.utc(wrapUpEndTimestamp)
        const now = moment.utc()

        if (now?.isAfter(wrapUpMoment)) {
            clearWrapUpTime()
            return
        }

        const timeLeft = moment.utc(wrapUpMoment?.diff(now)).format('mm:ss')
        setTimeLeft(timeLeft)
    }, 500)

    useEffect(() => {
        const wrapUpTimeStartedEvent = {
            name: SocketEventType.VoiceCallWrapUpTimeStarted,
            onReceive: handleWrapUpTimeStarted,
        }

        socketManager.registerReceivedEvents([wrapUpTimeStartedEvent])

        return () => {
            socketManager.unregisterReceivedEvents([wrapUpTimeStartedEvent])
        }
        // eslint-disable-next-line exhaustive-deps
    }, [])

    return {
        isWrappingUp: !!wrapUpEndTimestamp,
        timeLeft,
        voiceCall,
        endWrapUpTimeMutation,
        clearWrapUpTime,
    }
}
