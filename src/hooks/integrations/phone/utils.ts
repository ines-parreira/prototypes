import crypto from 'crypto'
import {Call} from '@twilio/voice-sdk'

import client from 'models/api/resources'
import socketManager from 'services/socketManager/socketManager'
import {SocketEventType} from 'services/socketManager/types'
import {TwilioSocketEvent} from 'business/twilio'

export async function getToken(): Promise<string | null> {
    const response = await client.get('/integrations/phone/token')
    const data: {token: string | null} = await response.data
    return data.token
}

export function sendTwilioSocketEvent(event: TwilioSocketEvent) {
    socketManager.send(SocketEventType.TwilioEventTriggered, event)
}

export function generateCallId(call: Call): string {
    const shasum = crypto.createHash('sha256')

    switch (call.direction) {
        case Call.CallDirection.Outgoing: {
            const from = call.customParameters.get('From')!
            const to = call.customParameters.get('To')!

            shasum.update(`${from}.${to}`)
            break
        }

        case Call.CallDirection.Incoming: {
            const from = call.parameters.From
            const to = call.customParameters.get('to')!

            shasum.update(`${from}.${to}`)
            break
        }
    }

    return shasum.digest('hex')
}

export function getCallSid(call: Call): Maybe<string> {
    switch (call.direction) {
        case Call.CallDirection.Outgoing: {
            return call.parameters.CallSid
        }
        case Call.CallDirection.Incoming: {
            return call.customParameters.get('call_sid')
        }
    }
}

export function gatherCallContext(call: Call): {
    id: string
    call_sid: Maybe<string>
} {
    return {
        id: generateCallId(call),
        call_sid: getCallSid(call),
    }
}
