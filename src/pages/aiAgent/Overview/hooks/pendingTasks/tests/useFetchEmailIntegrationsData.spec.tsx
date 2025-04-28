import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { AiAgentOverviewRootStateFixture } from 'pages/aiAgent/Overview/tests/AiAgentOverviewRootState.fixture'
import { renderHook } from 'utils/testing/renderHook'

import { useFetchEmailIntegrationsData } from '../useFetchEmailIntegrationsData'

const rootState = AiAgentOverviewRootStateFixture.start()
    .withGmailEmailIntegration()
    .withGmailEmailIntegration()
    .build()

describe('useFetchEmailIntegrationsData', () => {
    it('should not fail if the store is empty', () => {
        const hook = renderHook(() => useFetchEmailIntegrationsData(), {
            wrapper: ({ children }) => (
                <Provider store={configureMockStore()({})}>{children}</Provider>
            ),
        })

        expect(hook.result.current).toEqual({ data: [] })
    })

    it('should return well mapped emails', () => {
        const hook = renderHook(() => useFetchEmailIntegrationsData(), {
            wrapper: ({ children }) => (
                <Provider store={configureMockStore()(rootState)}>
                    {children}
                </Provider>
            ),
        })

        expect(hook.result.current).toEqual({
            data: [
                {
                    address: 'gmail-1@gmail.com',
                    id: 1,
                    isDefault: true,
                    isVerified: true,
                },
                {
                    address: 'gmail-2@gmail.com',
                    id: 2,
                    isDefault: true,
                    isVerified: true,
                },
            ],
        })
    })
})
