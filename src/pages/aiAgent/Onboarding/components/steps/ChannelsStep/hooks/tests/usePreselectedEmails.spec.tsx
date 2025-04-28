import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { IntegrationType } from 'models/integration/constants'
import { ShopifyIntegration } from 'models/integration/types'
import { listStoreMappings } from 'models/storeMapping/resources'
import { usePreselectedEmails } from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/usePreselectedEmails'
import { getIntegration } from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, mockStore } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

const queryClient = mockQueryClient()

jest.mock('models/storeMapping/resources')
const listStoreMappingsMock = assumeMock(listStoreMappings)

describe('usePreselectedEmails', () => {
    const renderUsePreselectedEmails = ({
        storeId,
        onboardingEmailIntegrationIds,
        shopifyIntegrations,
    }: {
        storeId: number
        onboardingEmailIntegrationIds: number[] | undefined
        shopifyIntegrations: ShopifyIntegration[]
    }) => {
        const defaultState = {
            currentAccount: fromJS(account),
            billing: fromJS(billingState),
            integrations: fromJS({
                integrations: [
                    getIntegration(1, IntegrationType.Email),
                    getIntegration(2, IntegrationType.Gmail),
                    getIntegration(3, IntegrationType.Outlook),
                    ...shopifyIntegrations,
                ],
            }),
        } as RootState

        return renderHook(
            () =>
                usePreselectedEmails({
                    storeId,
                    onboardingEmailIntegrationIds,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    </Provider>
                ),
            },
        )
    }

    describe('when single store', () => {
        const shopifyIntegrations = [
            getIntegration(4, IntegrationType.Shopify),
        ] as any as ShopifyIntegration[]

        beforeEach(() => {
            listStoreMappingsMock.mockResolvedValue([])
        })

        it('should return onboarding integration that are available email channel', () => {
            const { result } = renderUsePreselectedEmails({
                storeId: 4,
                onboardingEmailIntegrationIds: [1, 4],
                shopifyIntegrations,
            })

            expect(result.current).toEqual([1])
        })

        it('should return onboarding integration when there are existing data (some email selected)', () => {
            const { result } = renderUsePreselectedEmails({
                storeId: 4,
                onboardingEmailIntegrationIds: [1, 2],
                shopifyIntegrations,
            })

            expect(result.current).toEqual([1, 2])
        })

        it('should return onboarding integration when there are existing data (no email selected)', () => {
            const { result } = renderUsePreselectedEmails({
                storeId: 4,
                onboardingEmailIntegrationIds: [],
                shopifyIntegrations,
            })

            expect(result.current).toEqual([1, 2, 3])
        })

        it('should return all email integration when there is no onboarding integration', () => {
            const { result } = renderUsePreselectedEmails({
                storeId: 4,
                onboardingEmailIntegrationIds: undefined,
                shopifyIntegrations,
            })

            // Email Integration IDs
            expect(result.current).toEqual([1, 2, 3])
        })
    })

    describe('when multi store', () => {
        const shopifyIntegrations = [
            getIntegration(4, IntegrationType.Shopify),
            getIntegration(5, IntegrationType.Shopify),
        ] as any as ShopifyIntegration[]

        beforeEach(() => {
            listStoreMappingsMock.mockResolvedValue([])
        })

        it('should return onboarding integration that are available email channel', () => {
            const { result } = renderUsePreselectedEmails({
                storeId: 4,
                onboardingEmailIntegrationIds: [1, 4],
                shopifyIntegrations,
            })

            expect(result.current).toEqual([1])
        })

        it('should return onboarding integration when there are existing data (some email selected)', () => {
            const { result } = renderUsePreselectedEmails({
                storeId: 4,
                onboardingEmailIntegrationIds: [1, 2],
                shopifyIntegrations,
            })

            expect(result.current).toEqual([1, 2])
        })

        it('should return onboarding integration when there are existing data (no email selected)', () => {
            const { result } = renderUsePreselectedEmails({
                storeId: 4,
                onboardingEmailIntegrationIds: [],
                shopifyIntegrations,
            })

            expect(result.current).toEqual([])
        })

        it('should return all email integration associated to this store when there is no onboarding integration', async () => {
            listStoreMappingsMock.mockResolvedValue([
                {
                    store_id: 4,
                    integration_id: 1,
                },
                {
                    store_id: 5,
                    integration_id: 2,
                },
                {
                    store_id: 5,
                    integration_id: 3,
                },
            ])

            const { result, waitForNextUpdate } = renderUsePreselectedEmails({
                storeId: 4,
                onboardingEmailIntegrationIds: undefined,
                shopifyIntegrations,
            })

            expect(result.current).toEqual([])
            await waitForNextUpdate()
            expect(result.current).toEqual([1])
        })
    })
})
