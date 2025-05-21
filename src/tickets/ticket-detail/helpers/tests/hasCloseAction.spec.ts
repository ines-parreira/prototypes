import type { TicketMessage } from '@gorgias/api-types'

import { TicketStatus } from 'business/types/ticket'
import { MacroActionName } from 'models/macroAction/types'

import { hasCloseAction } from '../hasCloseAction'

describe('hasCloseAction', () => {
    it('should return false if the message has no actions', () => {
        const message = {} as TicketMessage
        const result = hasCloseAction(message)
        expect(result).toBe(false)
    })

    it('should return false if there are no actions that set the status to closed', () => {
        const message = {
            actions: [
                {
                    name: MacroActionName.SetStatus,
                    arguments: { status: TicketStatus.Open },
                },
            ],
        } as unknown as TicketMessage
        const result = hasCloseAction(message)
        expect(result).toBe(false)
    })

    it('should return true if there is an action that sets the status to closed', () => {
        const message = {
            actions: [
                {
                    name: MacroActionName.SetStatus,
                    arguments: { status: TicketStatus.Closed },
                },
            ],
        } as unknown as TicketMessage
        const result = hasCloseAction(message)
        expect(result).toBe(true)
    })
})
