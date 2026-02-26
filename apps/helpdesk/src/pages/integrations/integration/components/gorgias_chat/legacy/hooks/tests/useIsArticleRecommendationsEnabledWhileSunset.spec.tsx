import type React from 'react'

import * as featureFlagsModule from '@repo/feature-flags'
import { renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { IntegrationType } from 'models/integration/constants'
import {
    CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE,
    useIsArticleRecommendationsEnabledWhileSunset,
} from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'
import { mockStore } from 'utils/testing'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

describe('useIsArticleRecommendationsEnabledWhileSunset', () => {
    const mockedUseFlag = featureFlagsModule.useFlag as jest.MockedFunction<
        typeof featureFlagsModule.useFlag
    >

    const createStoreWithIntegrationsAndAccount = ({
        integrations = [],
        accountCreatedDate = '2024-01-01T00:00:00Z',
    }: {
        integrations?: Array<{ id: number; type: string }>
        accountCreatedDate?: string
    }) => {
        return mockStore({
            currentAccount: fromJS({
                created_datetime: accountCreatedDate,
            }),
            integrations: fromJS({
                integrations: integrations,
            }),
        })
    }

    const wrapper = ({
        children,
        store,
    }: {
        children: React.ReactNode
        store: any
    }) => <Provider store={store}>{children}</Provider>

    describe('Phase 1 - DisableArticleRecommendationForShopify is false', () => {
        beforeEach(() => {
            mockedUseFlag.mockReturnValue(false)
        })

        it('merchant is new -> no article recommendation in both settings and stats', () => {
            const newDate = new Date(CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE)
            newDate.setDate(newDate.getDate() + 1) // One day after sunset date

            const store = createStoreWithIntegrationsAndAccount({
                integrations: [{ id: 1, type: IntegrationType.Shopify }],
                accountCreatedDate: newDate.toISOString(),
            })

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                {
                    wrapper: ({ children }) => wrapper({ children, store }),
                },
            )

            expect(result.current.enabledInSettings).toBe(false)
            expect(result.current.enabledInStatistics).toBe(false)
        })

        it('merchant is old -> article recommendation visible in settings and stats', () => {
            const oldDate = new Date(CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE)
            oldDate.setDate(oldDate.getDate() - 1) // One day before sunset date

            const store = createStoreWithIntegrationsAndAccount({
                integrations: [{ id: 1, type: IntegrationType.Shopify }],
                accountCreatedDate: oldDate.toISOString(),
            })

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                {
                    wrapper: ({ children }) => wrapper({ children, store }),
                },
            )

            expect(result.current.enabledInSettings).toBe(true)
            expect(result.current.enabledInStatistics).toBe(true)
        })

        it('merchant has BigCommerce/Magento integration -> article recommendation visible in settings and stats', () => {
            const store = createStoreWithIntegrationsAndAccount({
                integrations: [
                    { id: 1, type: IntegrationType.BigCommerce },
                    { id: 2, type: IntegrationType.Shopify },
                ],
                accountCreatedDate: '2026-01-01T00:00:00Z', // New merchant
            })

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                {
                    wrapper: ({ children }) => wrapper({ children, store }),
                },
            )

            expect(result.current.enabledInSettings).toBe(true)
            expect(result.current.enabledInStatistics).toBe(true)
        })
    })

    describe('Phase 2 - DisableArticleRecommendationForShopify is true', () => {
        beforeEach(() => {
            mockedUseFlag.mockReturnValue(true)
        })

        it('merchant is new -> no article recommendation in settings', () => {
            const newDate = new Date(CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE)
            newDate.setDate(newDate.getDate() + 1) // One day after sunset date

            const store = createStoreWithIntegrationsAndAccount({
                integrations: [{ id: 1, type: IntegrationType.Shopify }],
                accountCreatedDate: newDate.toISOString(),
            })

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                {
                    wrapper: ({ children }) => wrapper({ children, store }),
                },
            )

            expect(result.current.enabledInSettings).toBe(false)
            expect(result.current.enabledInStatistics).toBe(false)
        })

        it('merchant is old -> no article recommendation in settings', () => {
            const oldDate = new Date(CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE)
            oldDate.setDate(oldDate.getDate() - 1) // One day before sunset date

            const store = createStoreWithIntegrationsAndAccount({
                integrations: [{ id: 1, type: IntegrationType.Shopify }],
                accountCreatedDate: oldDate.toISOString(),
            })

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                {
                    wrapper: ({ children }) => wrapper({ children, store }),
                },
            )

            expect(result.current.enabledInSettings).toBe(false)
            expect(result.current.enabledInStatistics).toBe(true)
        })

        it('merchant has BigCommerce/Magento -> article recommendation visible only in stats', () => {
            const store = createStoreWithIntegrationsAndAccount({
                integrations: [
                    { id: 1, type: IntegrationType.Magento2 },
                    { id: 2, type: IntegrationType.Shopify },
                ],
                accountCreatedDate: '2026-01-01T00:00:00Z', // New merchant
            })

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                {
                    wrapper: ({ children }) => wrapper({ children, store }),
                },
            )

            expect(result.current.enabledInSettings).toBe(false)
            expect(result.current.enabledInStatistics).toBe(true)
        })
    })
})
