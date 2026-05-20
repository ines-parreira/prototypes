import { appQueryClient } from '@repo/api-resources'

import { queryKeys } from '@gorgias/helpdesk-queries'
import type { View } from '@gorgias/helpdesk-types'

import { getActiveViewIdFromUrl } from '../activeView'

function setAllViews(views: View[]): void {
    appQueryClient.setQueryData(queryKeys.views.listAllViews({ limit: 100 }), {
        pages: [
            {
                data: {
                    data: views,
                },
            },
        ],
        pageParams: [undefined],
    })
}

function setSystemViews(views: View[]): void {
    appQueryClient.setQueryData(
        queryKeys.views.listAllViews({ limit: 100, category: 'system' }),
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
}

beforeEach(() => {
    appQueryClient.clear()
    Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true,
    })
})

describe('getActiveViewIdFromUrl', () => {
    it('uses the explicit view ID from the URL when one is present', () => {
        window.location.pathname = '/app/views/42'

        expect(getActiveViewIdFromUrl()).toBe(42)
    })

    it('resolves /app/views to the cached system Inbox view ID', () => {
        setSystemViews([{ id: 5, name: 'Inbox' } as View])
        window.location.pathname = '/app/views'

        expect(getActiveViewIdFromUrl()).toBe(5)
    })

    it('resolves /app/views from the all-views cache when the system cache is empty', () => {
        setAllViews([{ id: 6, name: 'Inbox', category: 'system' } as View])
        window.location.pathname = '/app/views'

        expect(getActiveViewIdFromUrl()).toBe(6)
    })

    it.each(['/app', '/app/', '/app/tickets', '/app/tickets/'])(
        'does not assume %s is the Inbox view',
        (path) => {
            setSystemViews([{ id: 5, name: 'Inbox' } as View])
            window.location.pathname = path

            expect(getActiveViewIdFromUrl()).toBeNull()
        },
    )

    it('does not resolve a non-system view named Inbox as the /app/views active view', () => {
        setAllViews([{ id: 7, name: 'Inbox', category: null } as View])
        window.location.pathname = '/app/views'

        expect(getActiveViewIdFromUrl()).toBeNull()
    })
})
