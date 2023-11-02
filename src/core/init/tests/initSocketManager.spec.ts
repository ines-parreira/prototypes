import socketManager from 'services/socketManager'

jest.mock('services/socketManager', () => ({
    registerJoinEvents: jest.fn(),
    registerReceivedEvents: jest.fn(),
    registerSendEvents: jest.fn(),
}))
jest.mock('../socketEvents/joinEvents', () => ['join-event-1', 'join-event-2'])
jest.mock('../socketEvents/receivedEvents', () => [
    'received-event-1',
    'received-event-2',
])
jest.mock('../socketEvents/sendEvents', () => ['send-event-1', 'send-event-2'])

describe('initSocketmanager', () => {
    it('should register events with the socket manager', () => {
        require('../initSocketManager')
        expect(socketManager.registerJoinEvents).toHaveBeenCalledWith([
            'join-event-1',
            'join-event-2',
        ])
        expect(socketManager.registerReceivedEvents).toHaveBeenCalledWith([
            'received-event-1',
            'received-event-2',
        ])
        expect(socketManager.registerSendEvents).toHaveBeenCalledWith([
            'send-event-1',
            'send-event-2',
        ])
    })
})
