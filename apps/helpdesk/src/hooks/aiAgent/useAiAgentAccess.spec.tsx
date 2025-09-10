import React from 'react'

import { renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { AutomatePlan } from 'models/billing/types'
import * as useTrialAccessModule from 'pages/aiAgent/trial/hooks/useTrialAccess'
import * as billingSelectors from 'state/billing/selectors'

import { useAiAgentAccess } from './useAiAgentAccess'

jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
jest.mock('state/billing/selectors', () => ({
    ...jest.requireActual('state/billing/selectors'),
    getCurrentAutomatePlan: jest.fn(),
}))

const middlewares = [thunk]
const mockStoreCreator = configureStore(middlewares)

describe('useAiAgentAccess', () => {
    const mockedUseTrialAccess = jest.mocked(
        useTrialAccessModule.useTrialAccess,
    )
    const mockedGetCurrentAutomatePlan = jest.mocked(
        billingSelectors.getCurrentAutomatePlan,
    )

    const mockStore = mockStoreCreator({
        billing: fromJS({
            automatePlan: null,
            products: [],
        }),
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={mockStore}>
            <MemoryRouter>{children}</MemoryRouter>
        </Provider>
    )

    beforeEach(() => {
        jest.clearAllMocks()
        mockedGetCurrentAutomatePlan.mockReturnValue(undefined)
    })

    describe('when user has an automate plan', () => {
        it('should return hasAccess true and isLoading false', () => {
            // Mock the selector to return an automate plan
            mockedGetCurrentAutomatePlan.mockReturnValue({
                id: 1,
                name: 'USD5',
                generation: 5,
            } as unknown as AutomatePlan)

            // When there's an automate plan, we still need to mock useTrialAccess
            // even though its result shouldn't matter
            mockedUseTrialAccess.mockReturnValue({
                hasAnyTrialActive: false,
                hasCurrentStoreTrialActive: false,
                isLoading: false,
            } as any)

            const { result } = renderHook(() => useAiAgentAccess(), {
                wrapper,
            })

            expect(result.current).toEqual({
                hasAccess: true,
                isLoading: false,
            })

            // Verify that having a plan grants access regardless of trial status
            expect(mockedUseTrialAccess).toHaveBeenCalled()
        })
    })

    describe('when user has no automate plan', () => {
        const mockStoreWithoutPlan = mockStoreCreator({
            billing: fromJS({
                automatePlan: null,
                products: [],
            }),
        })

        const wrapperWithoutPlan = ({
            children,
        }: {
            children: React.ReactNode
        }) => (
            <Provider store={mockStoreWithoutPlan}>
                <MemoryRouter>{children}</MemoryRouter>
            </Provider>
        )

        describe('and has an active trial on current store', () => {
            it('should return hasAccess true when shopName is provided', () => {
                mockedUseTrialAccess.mockReturnValue({
                    hasAnyTrialActive: true,
                    hasCurrentStoreTrialActive: true,
                    isLoading: false,
                } as any)

                const { result } = renderHook(
                    () => useAiAgentAccess('test-shop'),
                    {
                        wrapper: wrapperWithoutPlan,
                    },
                )

                expect(result.current).toEqual({
                    hasAccess: true,
                    isLoading: false,
                })
            })
        })

        describe('and has an active trial on any store', () => {
            it('should return hasAccess true', () => {
                mockedUseTrialAccess.mockReturnValue({
                    hasAnyTrialActive: true,
                    hasCurrentStoreTrialActive: false,
                    isLoading: false,
                } as any)

                const { result } = renderHook(() => useAiAgentAccess(), {
                    wrapper: wrapperWithoutPlan,
                })

                expect(result.current).toEqual({
                    hasAccess: true,
                    isLoading: false,
                })
            })
        })

        describe('and has no active trials', () => {
            it('should return hasAccess false', () => {
                mockedUseTrialAccess.mockReturnValue({
                    hasAnyTrialActive: false,
                    hasCurrentStoreTrialActive: false,
                    isLoading: false,
                } as any)

                const { result } = renderHook(() => useAiAgentAccess(), {
                    wrapper: wrapperWithoutPlan,
                })

                expect(result.current).toEqual({
                    hasAccess: false,
                    isLoading: false,
                })
            })
        })

        describe('when trial data is loading', () => {
            it('should return isLoading true', () => {
                mockedUseTrialAccess.mockReturnValue({
                    hasAnyTrialActive: false,
                    hasCurrentStoreTrialActive: false,
                    isLoading: true,
                } as any)

                const { result } = renderHook(() => useAiAgentAccess(), {
                    wrapper: wrapperWithoutPlan,
                })

                expect(result.current).toEqual({
                    hasAccess: false,
                    isLoading: true,
                })
            })
        })
    })

    describe('shop name specific checks', () => {
        const mockStoreWithoutPlan = mockStoreCreator({
            billing: fromJS({
                automatePlan: null,
                products: [],
            }),
        })

        const wrapperWithoutPlan = ({
            children,
        }: {
            children: React.ReactNode
        }) => (
            <Provider store={mockStoreWithoutPlan}>
                <MemoryRouter>{children}</MemoryRouter>
            </Provider>
        )

        it('should prioritize current store trial when shop name is provided', () => {
            mockedUseTrialAccess.mockReturnValue({
                hasAnyTrialActive: false,
                hasCurrentStoreTrialActive: true,
                isLoading: false,
            } as any)

            const { result } = renderHook(() => useAiAgentAccess('my-shop'), {
                wrapper: wrapperWithoutPlan,
            })

            expect(result.current).toEqual({
                hasAccess: true,
                isLoading: false,
            })
            expect(mockedUseTrialAccess).toHaveBeenCalledWith('my-shop')
        })

        it('should not fall back to any trial when current store has no trial', () => {
            mockedUseTrialAccess.mockReturnValue({
                hasAnyTrialActive: true,
                hasCurrentStoreTrialActive: false,
                isLoading: false,
            } as any)

            const { result } = renderHook(() => useAiAgentAccess('my-shop'), {
                wrapper: wrapperWithoutPlan,
            })

            expect(result.current).toEqual({
                hasAccess: false,
                isLoading: false,
            })
        })
    })
})
