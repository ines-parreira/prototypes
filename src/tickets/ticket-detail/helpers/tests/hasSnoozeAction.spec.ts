import type { TicketMessage } from '@gorgias/api-types'

import { MacroActionName } from 'models/macroAction/types'

import { hasSnoozeAction } from '../hasSnoozeAction'

describe('hasSnoozeAction', () => {
    it('should return false if the message has no actions', () => {
        const message = {} as TicketMessage
        const result = hasSnoozeAction(message)
        expect(result).toBe(false)
    })

    it('should return false if there are no actions that snooze the ticket', () => {
        const message = {
            actions: [{ name: 'unknown' }],
        } as unknown as TicketMessage
        const result = hasSnoozeAction(message)
        expect(result).toBe(false)
    })

    it('should return true if there is an action that snoozes the ticket', () => {
        const message = {
            actions: [{ name: MacroActionName.SnoozeTicket }],
        } as unknown as TicketMessage
        const result = hasSnoozeAction(message)
        expect(result).toBe(true)
    })
})
