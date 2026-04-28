import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import type { ViewVisibility } from 'models/view/types'
import { ViewField } from 'models/view/types'

import { useDraftViewState } from '../useDraftViewState'

jest.mock('config/views', () => ({
    getConfigByType: jest.fn(() => ({
        get: jest.fn((key: string) => {
            if (key !== 'newView') {
                return undefined
            }

            return (visibility?: ViewVisibility) =>
                fromJS({
                    id: 1,
                    visibility,
                    fields: [ViewField.Details, ViewField.Subject],
                })
        }),
    })),
}))

describe('useDraftViewState', () => {
    it('does nothing when resetting without a new route visibility', () => {
        const activeView = fromJS({
            id: 123,
            fields: [ViewField.Details, ViewField.Customer],
        })

        const { result } = renderHook(() =>
            useDraftViewState({
                activeView,
                isNewViewRoute: false,
                newRouteVisibility: null,
            }),
        )

        expect(() => {
            result.current.resetDraftFields()
        }).not.toThrow()
        expect(result.current.draftFields).toEqual([])
    })
})
