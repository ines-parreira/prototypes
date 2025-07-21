import type { TicketMessage } from '@gorgias/helpdesk-types'

import { MacroActionName } from 'models/macroAction/types'

import { hasHandoverAction } from '../hasHandoverAction'

describe('hasHandoverAction', () => {
    it('should return false if the message has no actions', () => {
        const message = {} as TicketMessage
        const result = hasHandoverAction(message)
        expect(result).toBe(false)
    })

    it('should return false if there are no actions that add tags', () => {
        const message = {
            actions: [{ name: 'unknown' }],
        } as unknown as TicketMessage
        const result = hasHandoverAction(message)
        expect(result).toBe(false)
    })

    it('should return false if there is a single tag that is not a handover', () => {
        const message = {
            actions: [
                { name: MacroActionName.AddTags, arguments: { tags: 'nop' } },
            ],
        } as unknown as TicketMessage
        const result = hasHandoverAction(message)
        expect(result).toBe(false)
    })

    it('should return true if there is a single tag that is a handover', () => {
        const message = {
            actions: [
                {
                    name: MacroActionName.AddTags,
                    arguments: { tags: 'ai_handover' },
                },
            ],
        } as unknown as TicketMessage
        const result = hasHandoverAction(message)
        expect(result).toBe(true)
    })

    it('should return true if there are multiple tags of which one is a handover', () => {
        const message = {
            actions: [
                {
                    name: MacroActionName.AddTags,
                    arguments: { tags: 'ai_handover,nop' },
                },
            ],
        } as unknown as TicketMessage
        const result = hasHandoverAction(message)
        expect(result).toBe(true)
    })

    it('should return true if there is a handover tag, evem if spacing is weird', () => {
        const message = {
            actions: [
                {
                    name: MacroActionName.AddTags,
                    arguments: { tags: '  ai_handover   ,nop' },
                },
            ],
        } as unknown as TicketMessage
        const result = hasHandoverAction(message)
        expect(result).toBe(true)
    })
})
