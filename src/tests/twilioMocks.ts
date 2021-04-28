import {Connection, Device} from 'twilio-client'

export const mockDevice = (): Partial<Device> => ({})

export const mockIncomingConnection = (
    integrationId = 1
): Partial<Connection> => ({
    direction: Connection.CallDirection.Incoming,
    customParameters: new Map([
        ['integration_id', integrationId.toString()],
        ['customer_name', 'Bob'],
    ]),
    parameters: {From: '+14158880101'},
    isMuted: () => false,
    accept: jest.fn(),
    ignore: jest.fn(),
    mute: jest.fn(),
    disconnect: jest.fn(),
})

export const mockOutgoingConnection = (
    integrationId = 1
): Partial<Connection> => ({
    direction: Connection.CallDirection.Outgoing,
    customParameters: new Map([
        ['integration_id', integrationId.toString()],
        ['customer_name', 'Bob'],
        ['To', '+14158880101'],
    ]),
    isMuted: () => false,
    mute: jest.fn(),
    disconnect: jest.fn(),
})
