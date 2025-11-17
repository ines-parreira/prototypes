import type { TicketMessage } from 'models/ticket/types'

import { changeTicketMessage } from '../actions'
import { UIActions } from '../types'

describe('changeTicketMessage', () => {
    it('should create an action to change the active tab with a message', () => {
        const message = { id: '1' } as unknown as TicketMessage
        const expectedAction = {
            type: UIActions.ChangeTicketMessage,
            payload: { message },
        }
        expect(changeTicketMessage({ message })).toEqual(expectedAction)
    })
})
