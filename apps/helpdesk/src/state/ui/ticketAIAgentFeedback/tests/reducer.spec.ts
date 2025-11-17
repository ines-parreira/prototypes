import type { AnyAction } from '@reduxjs/toolkit'

import type { TicketMessage } from 'models/ticket/types'

import { changeTicketMessage } from '../actions'
import reducer, { initialState } from '../reducer'

describe('ticketAIAgentFeedback reducer', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {} as AnyAction)).toEqual(initialState)
    })

    it('should handle changeTicketMessage with message', () => {
        const newMessage = { id: '1' } as unknown as TicketMessage
        const action = changeTicketMessage({ message: newMessage })
        const newState = reducer(initialState, action)

        expect(newState.feedback.message).toEqual(newMessage)
    })
})
