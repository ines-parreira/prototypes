import { describe, expect, it } from 'vitest'

import type { Macro } from '@gorgias/helpdesk-types'

import { MacroActionName } from '../../../../../utils/macros/types'
import { getMacroTicketFieldValues } from '../utils/getMacroTicketFieldValues'

describe('getMacroTicketFieldValues', () => {
    it('should return an empty object when macro is undefined', () => {
        expect(getMacroTicketFieldValues(undefined)).toEqual({})
    })

    it('should return an empty object when macro has no actions', () => {
        expect(getMacroTicketFieldValues({ id: 1 } as Macro)).toEqual({})
        expect(
            getMacroTicketFieldValues({ id: 1, actions: [] } as Macro),
        ).toEqual({})
    })

    it('should extract custom field values of all types from SetCustomFieldValue but ignore other actions types and empty value', () => {
        const macro = {
            id: 1,
            actions: [
                {
                    name: MacroActionName.SetStatus,
                    title: 'Set status',
                    arguments: { status: 'open' },
                },
                {
                    name: MacroActionName.SetCustomFieldValue,
                    title: 'Set field 1',
                    arguments: { custom_field_id: 10, value: 'hello' },
                },
                {
                    name: MacroActionName.SetCustomFieldValue,
                    title: 'Set field 2',
                    arguments: { custom_field_id: 20, value: 42 },
                },
                {
                    name: MacroActionName.SetCustomFieldValue,
                    title: 'Set field 3',
                    arguments: { custom_field_id: 30, value: true },
                },
                {
                    name: MacroActionName.SetCustomFieldValue,
                    title: 'Empty value',
                    arguments: { custom_field_id: 10, value: '' },
                },
            ],
        } as Macro

        expect(getMacroTicketFieldValues(macro)).toEqual({
            10: 'hello',
            20: 42,
            30: true,
        })
    })
})
