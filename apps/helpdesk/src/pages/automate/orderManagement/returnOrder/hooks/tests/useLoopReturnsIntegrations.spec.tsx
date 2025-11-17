import type React from 'react'

import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type { RootState, StoreDispatch } from 'state/types'

import useLoopReturnsIntegrations from '../useLoopReturnsIntegrations'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <Provider
        store={mockStore({
            integrations: fromJS({
                integrations: [
                    {
                        type: 'http',
                        http: { url: 'https://api.loopreturns.com/test' },
                    },
                    { type: 'email', meta: { address: 'test@gorgias.com' } },
                ],
            }),
        })}
    >
        {children}
    </Provider>
)

describe('useLoopReturnsIntegrations', () => {
    it('should filter loop return integrations', () => {
        const { result } = renderHook(() => useLoopReturnsIntegrations(), {
            wrapper,
        })

        expect(result.current).toMatchObject([
            {
                http: {
                    url: 'https://api.loopreturns.com/test',
                },
                type: 'http',
            },
        ])
    })
})
