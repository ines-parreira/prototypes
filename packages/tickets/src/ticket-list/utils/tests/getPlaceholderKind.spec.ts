import { describe, expect, it } from 'vitest'

import type { View } from '@gorgias/helpdesk-types'

import { EmptyViewsState } from '../../../utils/views'
import { getPlaceholderKind } from '../getPlaceholderKind'

describe('getPlaceholderKind', () => {
    const notFoundError = {
        response: {
            status: 404,
        },
    }

    it.each([
        {
            description: 'returns invalidFilters for deactivated views',
            params: {
                view: { deactivated_datetime: '2026-03-19T10:00:00Z' } as View,
                error: new Error('Request failed'),
                isEmpty: true,
            },
            expected: EmptyViewsState.InvalidFilters,
        },
        {
            description: 'returns inaccessible for null views',
            params: {
                view: null,
                error: new Error('Request failed'),
                isEmpty: true,
            },
            expected: EmptyViewsState.Inaccessible,
        },
        {
            description: 'returns inaccessible for not found errors',
            params: {
                view: {} as View,
                error: notFoundError,
                isEmpty: true,
            },
            expected: EmptyViewsState.Inaccessible,
        },
        {
            description:
                'returns error when the view is accessible and the request failed',
            params: {
                view: {} as View,
                error: new Error('Request failed'),
                isEmpty: true,
            },
            expected: EmptyViewsState.Error,
        },
        {
            description:
                'returns empty when the view is accessible and has no tickets',
            params: {
                view: {} as View,
                error: null,
                isEmpty: true,
            },
            expected: EmptyViewsState.Empty,
        },
        {
            description:
                'returns null when the view is accessible and tickets exist',
            params: {
                view: {} as View,
                error: null,
                isEmpty: false,
            },
            expected: null,
        },
    ])('$description', ({ params, expected }) => {
        expect(getPlaceholderKind(params)).toBe(expected)
    })
})
