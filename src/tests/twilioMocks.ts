import {Connection, Device} from 'twilio-client'

export const mockDevice = (): Partial<Device> => ({})

const mockConnection = (): Partial<Connection> => ({
    isMuted: () => false,
    mute: jest.fn(),
    disconnect: jest.fn(),
    sendDigits: jest.fn(),
})

export const mockIncomingConnection = (
    integrationId = 1,
    ticketId = 2
): Partial<Connection> => ({
    ...mockConnection(),
    direction: Connection.CallDirection.Incoming,
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

export const mockOutgoingConnection = (
    integrationId = 1
): Partial<Connection> => ({
    ...mockConnection(),
    direction: Connection.CallDirection.Outgoing,
    customParameters: new Map([
        ['integration_id', integrationId.toString()],
        ['customer_name', 'Bob'],
        ['To', '+14158880101'],
    ]),
})
