import {Connection, Device} from 'twilio-client'

export const mockDevice = (): Partial<Device> => ({})

export const mockConnection = (integrationId = 1): Partial<Connection> => ({
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
