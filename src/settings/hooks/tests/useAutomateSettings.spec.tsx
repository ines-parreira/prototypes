import React from 'react'
import type { ChangeEvent, ReactNode } from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { createBrowserHistory } from 'history'
import type { History } from 'history'
import { Route, Router } from 'react-router-dom'

import { IntegrationType, StoreIntegration } from 'models/integration/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { assumeMock } from 'utils/testing'

import { BASE_PATH, useAutomateSettings } from '../useAutomateSettings'

jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => jest.fn())
const useStoreIntegrationsMock = assumeMock(useStoreIntegrations)

const createWrapper =
    (history: History) =>
    ({ children }: { children: ReactNode }) => (
        <Router history={history}>
            <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                {children}
            </Route>
        </Router>
    )

describe('useAutomateSettings', () => {
    const integrations = [
        { id: 1, type: IntegrationType.Shopify, name: 'my-first-store' },
        { id: 2, type: IntegrationType.Shopify, name: 'my-second-store' },
    ] as StoreIntegration[]

    beforeEach(() => {
        useStoreIntegrationsMock.mockReturnValue(integrations)
    })

    it('should redirect if no store has been selected yet', () => {
        const history = createBrowserHistory()
        history.push(BASE_PATH)

        renderHook(() => useAutomateSettings(), {
            wrapper: createWrapper(history),
        })

        expect(history.location.pathname).toBe(
            `${BASE_PATH}/shopify/my-first-store/flows`,
        )
    })

    it('should redirect when another store is selected', () => {
        const history = createBrowserHistory()
        history.push(`${BASE_PATH}/shopify/my-first-store/flows`)

        const { result } = renderHook(() => useAutomateSettings(), {
            wrapper: createWrapper(history),
        })

        result.current.onChangeIntegration({
            currentTarget: { value: '2' },
        } as ChangeEvent<HTMLSelectElement>)

        expect(history.location.pathname).toBe(
            `${BASE_PATH}/shopify/my-second-store/flows`,
        )
    })
})
