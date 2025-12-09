import type { Device } from '@twilio/voice-sdk'
import { Call } from '@twilio/voice-sdk'
import { EventEmitter } from 'events'

export const mockDevice = (): Partial<Device> => ({})

const mockCall = (): Partial<Call> => {
    const emitter = new EventEmitter()
    const mock: Partial<Call> = {
        isMuted: () => false,
        mute: jest.fn(),
        disconnect: jest.fn(),
        sendDigits: jest.fn(),
    }
    mock.on = jest.fn((event: string, handler: any) => {
        emitter.on(event, handler)
        return mock as Call
    })
    mock.off = jest.fn((event: string, handler: any) => {
        emitter.off(event, handler)
        return mock as Call
    })
    mock.emit = jest.fn((event: string, data: any) => {
        emitter.emit(event, data)
        return true
    })
    return mock
}

export const mockIncomingCall = (
    integrationId = 1,
    ticketId = 2,
): Partial<Call> => {
    return {
        ...mockCall(),
        direction: Call.CallDirection.Incoming,
        status: () => Call.State.Pending,
        customParameters: new Map([
            ['integration_id', integrationId.toString()],
            ['ticket_id', ticketId.toString()],
            ['call_sid', 'fake-call-sid'],
            ['customer_name', 'Bob'],
            ['customer_phone_number', '+25111111111'],
        ]),
        parameters: { From: '+14158880101' },
        accept: jest.fn(),
        ignore: jest.fn(),
        reject: jest.fn(),
    }
}

export const mockOutgoingCall = (integrationId = 1): Partial<Call> => {
    return {
        ...mockCall(),
        direction: Call.CallDirection.Outgoing,
        status: () => Call.State.Ringing,
        customParameters: new Map([
            ['integration_id', integrationId.toString()],
            ['customer_name', 'Bob'],
            ['To', '+14158880101'],
        ]),
        parameters: { From: '+25111111111' },
    }
}

export const mockMonitoringCall = (
    integrationId = 1,
    inCallAgentId = 123,
    customerId = 456,
    customerPhoneNumber = '+14158880101',
): Partial<Call> => {
    return {
        ...mockCall(),
        direction: Call.CallDirection.Outgoing,
        status: () => Call.State.Ringing,
        customParameters: new Map([
            ['main_call_sid', 'main-call-sid'],
            ['is_monitoring', 'true'],
            ['integration_id', integrationId.toString()],
            ['in_call_agent_id', inCallAgentId.toString()],
            ['customer_id', customerId.toString()],
            ['customer_phone_number', customerPhoneNumber],
        ]),
    }
}
