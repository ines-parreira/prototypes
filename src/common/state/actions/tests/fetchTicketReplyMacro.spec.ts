import {FETCH_TICKET_REPLY_MACRO} from '../../constants'

import fetchTicketReplyMacro from '../fetchTicketReplyMacro'

describe('fetchTicketReplyMacro', () => {
    it('should return the action object', () => {
        expect(fetchTicketReplyMacro()).toEqual({
            type: FETCH_TICKET_REPLY_MACRO,
        })
    })
})
