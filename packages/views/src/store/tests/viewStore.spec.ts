import { appQueryClient } from '@repo/api-resources'

import { mockView } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { getAllViews, getView } from '../viewStore'

beforeEach(() => {
    appQueryClient.clear()
})

describe('getView', () => {
    it('returns the view by ID', () => {
        const view = mockView({ id: 42 })
        appQueryClient.setQueryData(
            queryKeys.views.listAllViews({ limit: 100 }),
            {
                pages: [
                    {
                        data: {
                            data: [view],
                        },
                    },
                ],
                pageParams: [undefined],
            },
        )

        expect(getView(42)).toBe(view)
    })

    it('returns undefined for an unknown ID', () => {
        expect(getView(999)).toBeUndefined()
    })
})

describe('getAllViews', () => {
    it('returns all views', () => {
        const views = [mockView({ id: 1 }), mockView({ id: 2 })]
        appQueryClient.setQueryData(
            queryKeys.views.listAllViews({ limit: 100 }),
            {
                pages: [
                    {
                        data: {
                            data: views,
                        },
                    },
                ],
                pageParams: [undefined],
            },
        )

        expect(getAllViews()).toEqual(views)
    })

    it('returns an empty array when no views are set', () => {
        expect(getAllViews()).toEqual([])
    })
})
