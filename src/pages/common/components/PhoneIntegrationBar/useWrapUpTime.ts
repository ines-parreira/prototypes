import { useCallback, useEffect, useState } from 'react'

import moment from 'moment'

import {
    useEndWrapUpTime,
    useGetAgentWrapUpCallStatus,
} from '@gorgias/helpdesk-queries'

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
    const [wrapUpState, setWrapUpState] = useState<{
        wrapUpEndTimestamp: string | null
        voiceCall: Pick<
            VoiceCall,
            'id' | 'integration_id' | 'external_id'
        > | null
    }>({
        wrapUpEndTimestamp: null,
        voiceCall: null,
    })
    const [timeLeft, setTimeLeft] = useState<string | null>(null)
    const notify = useNotify()

    const { data: agentCallStatus } = useGetAgentWrapUpCallStatus({
        query: {
            refetchOnWindowFocus: false,
        },
    })

    const clearWrapUpTime = () => {
        setWrapUpState({
            wrapUpEndTimestamp: null,
            voiceCall: null,
        })
        setTimeLeft(null)
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
            setWrapUpState({
                wrapUpEndTimestamp: eventData.event.expiration_datetime,
                voiceCall: eventData.voice_call,
            })
        },
        [setWrapUpState],
    )

    useInterval(() => {
        if (!wrapUpState.wrapUpEndTimestamp) {
            return
        }

        const wrapUpMoment = moment.utc(wrapUpState.wrapUpEndTimestamp)
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

    useEffect(() => {
        if (agentCallStatus?.data?.status === 'wrapping-up') {
            setWrapUpState({
                wrapUpEndTimestamp: agentCallStatus.data.expiration_datetime,
                voiceCall:
                    agentCallStatus.data.call_id &&
                    agentCallStatus.data.integration_id &&
                    agentCallStatus.data.call_sid
                        ? {
                              id: Number(agentCallStatus.data.call_id),
                              integration_id: Number(
                                  agentCallStatus.data.integration_id,
                              ),
                              external_id: String(
                                  agentCallStatus.data.call_sid,
                              ),
                          }
                        : null,
            })
        }
    }, [agentCallStatus])

    return {
        isWrappingUp: !!wrapUpState.wrapUpEndTimestamp,
        timeLeft,
        voiceCall: wrapUpState.voiceCall,
        endWrapUpTimeMutation,
        clearWrapUpTime,
    }
}
