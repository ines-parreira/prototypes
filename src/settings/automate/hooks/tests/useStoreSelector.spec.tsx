import React from 'react'
import type { ReactNode } from 'react'

import { createBrowserHistory } from 'history'
import type { History } from 'history'
import { Route, Router } from 'react-router-dom'

import { IntegrationType, StoreIntegration } from 'models/integration/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useStoreSelector } from '../useStoreSelector'

export const BASE_PATH = '/app/settings/flows'

jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => jest.fn())
const useStoreIntegrationsMock = assumeMock(useStoreIntegrations)

const createWrapper =
    (history: History) =>
    ({ children }: { children?: ReactNode }) => (
        <Router history={history}>
            <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                {children}
            </Route>
        </Router>
    )

describe('useStoreSelector', () => {
    const integrations = [
        {
            id: 1,
            type: IntegrationType.Shopify,
            name: 'my-first-store',
            meta: { shop_name: 'my-first-store' },
        },
        {
            id: 2,
            type: IntegrationType.Shopify,
            name: 'my-second-store',
            meta: { shop_name: 'my-second-store' },
        },
    ] as StoreIntegration[]

    beforeEach(() => {
        useStoreIntegrationsMock.mockReturnValue(integrations)
    })

    it('should redirect if no store has been selected yet', () => {
        const history = createBrowserHistory()
        history.push(BASE_PATH)

        renderHook(() => useStoreSelector(BASE_PATH), {
            wrapper: createWrapper(history),
        })

        expect(history.location.pathname).toBe(
            `${BASE_PATH}/shopify/my-first-store`,
        )
    })

    it('should redirect when another store is selected', () => {
        const history = createBrowserHistory()
        history.push(`${BASE_PATH}/shopify/my-first-store`)

        const { result } = renderHook(() => useStoreSelector(BASE_PATH), {
            wrapper: createWrapper(history),
        })

        result.current.onChange(2)

        expect(history.location.pathname).toBe(
            `${BASE_PATH}/shopify/my-second-store`,
        )
    })
})
