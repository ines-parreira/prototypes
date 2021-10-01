import {Call, Device} from '@twilio/voice-sdk'

export const mockDevice = (): Partial<Device> => ({})

const mockCall = (): Partial<Call> => ({
    isMuted: () => false,
    mute: jest.fn(),
    disconnect: jest.fn(),
    sendDigits: jest.fn(),
})

export const mockIncomingCall = (
    integrationId = 1,
    ticketId = 2
): Partial<Call> => ({
    ...mockCall(),
    direction: Call.CallDirection.Incoming,
    customParameters: new Map([
        ['integration_id', integrationId.toString()],
        ['ticket_id', ticketId.toString()],
        ['call_sid', 'fake-call-sid'],
        ['customer_name', 'Bob'],
    ]),
    parameters: {From: '+14158880101'},
    accept: jest.fn(),
    ignore: jest.fn(),
})

export const mockOutgoingCall = (integrationId = 1): Partial<Call> => ({
    ...mockCall(),
    direction: Call.CallDirection.Outgoing,
    customParameters: new Map([
        ['integration_id', integrationId.toString()],
        ['customer_name', 'Bob'],
        ['To', '+14158880101'],
    ]),
})
