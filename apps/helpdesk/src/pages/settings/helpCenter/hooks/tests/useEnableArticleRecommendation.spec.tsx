import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { HelpCenter } from 'models/helpCenter/types'
import {
    fetchSelfServiceConfigurationSSP,
    updateSelfServiceConfigurationSSP,
} from 'models/selfServiceConfiguration/resources'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useEnableArticleRecommendation } from '../useEnableArticleRecommendation'

jest.mock('hooks/aiAgent/useAiAgentAccess')
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)
jest.mock('models/selfServiceConfiguration/resources')
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
const useTrialAccessMock = assumeMock(useTrialAccess)
const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    1: {
                        shop_name: 'test-shop-with-another-name',
                    },
                },
            },
        },
    } as any,
    integrations: fromJS({
        integrations: [
            {
                type: 'gorgias_chat',
                name: 'test-shop',
                meta: { app_id: '1', shop_name: 'test-shop' },
            },
            {
                type: 'gorgias_chat',
                name: 'test-shop',
                meta: { app_id: '2', shop_name: 'test-shop' },
            },
            {
                id: 1,
                type: 'shopify',
                name: 'test-shop',
                meta: { shop_name: 'test-shop' },
            },
        ],
    }),
    billing: fromJS({
        products: [],
    }),
}

const getDependencyWrapper = (state = defaultState) => {
    const dependencyWrapper: React.ComponentType<any> = ({
        children,
    }: {
        children: React.ReactNode
    }) => (
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state)}>{children}</Provider>
        </QueryClientProvider>
    )

    return dependencyWrapper
}

describe('useEnableArticleRecommendation', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        useTrialAccessMock.mockReturnValue({
            hasAnyTrialActive: false,
            hasCurrentStoreTrialActive: false,
            isLoading: false,
        } as any)
    })

    it('Should call updateSelfServiceConfiguration', async () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        ;(fetchSelfServiceConfigurationSSP as jest.Mock).mockResolvedValue({
            articleRecommendationHelpCenterId: null,
        })

        const { result } = renderHook(() => useEnableArticleRecommendation(), {
            wrapper: getDependencyWrapper(),
        })
        void result.current({ id: 999, shop_name: 'test-shop' } as HelpCenter)

        await waitFor(() => {
            expect(fetchSelfServiceConfigurationSSP).toHaveBeenCalledWith(
                'test-shop',
                'shopify',
            )
        })
        expect(updateSelfServiceConfigurationSSP).toHaveBeenCalledWith(
            expect.objectContaining({
                articleRecommendationHelpCenterId: 999,
            }),
        )
    })

    it('Should not call if there is already a help-center with the same store', async () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const { result } = renderHook(useEnableArticleRecommendation, {
            wrapper: getDependencyWrapper({
                ...defaultState,
                entities: {
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '28': { id: 28, shop_name: 'test-shop' },
                            },
                        },
                    },
                } as any,
            }),
        })

        void result.current({ id: 999, shop_name: 'test-shop' } as HelpCenter)

        await waitFor(() => {
            expect(fetchSelfServiceConfigurationSSP).not.toHaveBeenCalled()
        })
        expect(updateSelfServiceConfigurationSSP).not.toHaveBeenCalled()
    })

    it('Should not call if AI Agent is not enabled', async () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        const { result } = renderHook(useEnableArticleRecommendation, {
            wrapper: getDependencyWrapper(),
        })
        void result.current({ id: 999, shop_name: 'test-shop' } as HelpCenter)

        await waitFor(() => {
            expect(fetchSelfServiceConfigurationSSP).not.toHaveBeenCalled()
        })
        expect(updateSelfServiceConfigurationSSP).not.toHaveBeenCalled()
    })

    it('Should not call if there is already a articleRecommendationHelpCenterId', async () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        ;(fetchSelfServiceConfigurationSSP as jest.Mock).mockResolvedValue({
            articleRecommendationHelpCenterId: 2,
        })

        const { result } = renderHook(useEnableArticleRecommendation, {
            wrapper: getDependencyWrapper(),
        })
        void result.current({ id: 999, shop_name: 'test-shop' } as HelpCenter)

        await waitFor(() => {
            expect(fetchSelfServiceConfigurationSSP).toHaveBeenCalledWith(
                'test-shop',
                'shopify',
            )
        })
        expect(updateSelfServiceConfigurationSSP).not.toHaveBeenCalled()
    })

    it('Should not call if they are not related to the same shop', async () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const { result } = renderHook(useEnableArticleRecommendation, {
            wrapper: getDependencyWrapper(),
        })
        void result.current({
            id: 999,
            shop_name: 'test-shopopopop',
        } as HelpCenter)

        await waitFor(() => {
            expect(fetchSelfServiceConfigurationSSP).not.toHaveBeenCalled()
        })
        expect(fetchSelfServiceConfigurationSSP).not.toHaveBeenCalled()
    })
})
