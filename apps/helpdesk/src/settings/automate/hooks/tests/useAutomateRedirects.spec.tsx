import React from 'react'
import type { ReactNode } from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { createBrowserHistory } from 'history'
import type { History } from 'history'
import { Router } from 'react-router-dom'

import { useFlag } from 'core/flags'

import { useAutomateRedirects } from '../useAutomateRedirects'

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

const createWrapper =
    (history: History) =>
    ({ children }: { children?: ReactNode }) => (
        <Router history={history}>{children}</Router>
    )

describe('useAutomateRedirects', () => {
    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })

    it('should not redirect if the flag is disabled', () => {
        const history = createBrowserHistory()
        history.replace('/app/automation/shopify/my-first-store/flows')

        renderHook(() => useAutomateRedirects(), {
            wrapper: createWrapper(history),
        })

        expect(history.location.pathname).toBe(
            '/app/automation/shopify/my-first-store/flows',
        )
    })

    it('should redirect article recommendations', () => {
        useFlagMock.mockReturnValue(true)
        const history = createBrowserHistory()
        history.replace(
            '/app/automation/shopify/my-first-store/article-recommendation',
        )

        renderHook(() => useAutomateRedirects(), {
            wrapper: createWrapper(history),
        })

        expect(history.location.pathname).toBe(
            '/app/settings/article-recommendations/shopify/my-first-store',
        )
    })

    it('should redirect flows', () => {
        useFlagMock.mockReturnValue(true)
        const history = createBrowserHistory()
        history.replace('/app/automation/shopify/my-first-store/flows')

        renderHook(() => useAutomateRedirects(), {
            wrapper: createWrapper(history),
        })

        expect(history.location.pathname).toBe(
            '/app/settings/flows/shopify/my-first-store',
        )
    })

    it('should redirect order management', () => {
        useFlagMock.mockReturnValue(true)
        const history = createBrowserHistory()
        history.replace(
            '/app/automation/shopify/my-first-store/order-management',
        )

        renderHook(() => useAutomateRedirects(), {
            wrapper: createWrapper(history),
        })

        expect(history.location.pathname).toBe(
            '/app/settings/order-management/shopify/my-first-store',
        )
    })
})
