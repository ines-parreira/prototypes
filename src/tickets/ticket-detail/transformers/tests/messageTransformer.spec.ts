import { isFailed } from 'models/ticket/predicates'

import type { TicketElement } from '../../types'
import { messageTransformer } from '../messageTransformer'

jest.mock('models/ticket/predicates', () => ({
    ...jest.requireActual('models/ticket/predicates'),
    isFailed: jest.fn(),
}))

const isFailedMock = jest.mocked(isFailed)

describe('messageTransformer', () => {
    beforeEach(() => {
        isFailedMock.mockReturnValue(false)
    })

    it('should filter out any messages that are hidden', () => {
        const elements = [
            { type: 'event' },
            { type: 'message', data: { meta: {} } },
            { type: 'message', data: { meta: { hidden: true } } },
        ] as TicketElement[]

        const result = messageTransformer(elements)
        expect(result).toEqual([
            { type: 'event' },
            { type: 'message', data: { meta: {} } },
        ])
    })
})
