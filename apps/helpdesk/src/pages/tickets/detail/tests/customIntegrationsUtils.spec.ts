import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'

import {
    getWidgetId,
    getWidgetType,
    toWidgetArray,
} from '../customIntegrationsUtils'

describe('getWidgetType()', () => {
    it('should return the type of a widget', () => {
        const widget = fromJS({ type: 'custom', id: 1 }) as Map<string, unknown>
        expect(getWidgetType(widget)).toBe('custom')
    })

    it('should return undefined when type is not set', () => {
        const widget = fromJS({ id: 1 }) as Map<string, unknown>
        expect(getWidgetType(widget)).toBeUndefined()
    })
})

describe('getWidgetId()', () => {
    it('should return the id of a widget', () => {
        const widget = fromJS({ id: 42, type: 'custom' }) as Map<
            string,
            unknown
        >
        expect(getWidgetId(widget)).toBe(42)
    })

    it('should return undefined when id is not set', () => {
        const widget = fromJS({ type: 'custom' }) as Map<string, unknown>
        expect(getWidgetId(widget)).toBeUndefined()
    })
})

describe('toWidgetArray()', () => {
    it('should convert a List of widgets to an array', () => {
        const widgets = fromJS([
            { type: 'custom', id: 1 },
            { type: 'standalone', id: 2 },
        ]) as List<Map<string, unknown>>

        const result = toWidgetArray(widgets)

        expect(Array.isArray(result)).toBe(true)
        expect(result).toHaveLength(2)
        expect(result[0].get('id')).toBe(1)
        expect(result[1].get('id')).toBe(2)
    })

    it('should return an empty array when given undefined', () => {
        expect(toWidgetArray(undefined)).toEqual([])
    })

    it('should return an empty array when given an empty List', () => {
        const widgets = fromJS([]) as List<Map<string, unknown>>
        expect(toWidgetArray(widgets)).toEqual([])
    })
})
