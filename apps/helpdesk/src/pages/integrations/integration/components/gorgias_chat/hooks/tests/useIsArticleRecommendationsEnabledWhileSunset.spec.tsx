import React from 'react'

import { renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { IntegrationType } from 'models/integration/constants'
import {
    CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE,
    useIsArticleRecommendationsEnabledWhileSunset,
} from 'pages/integrations/integration/components/gorgias_chat/hooks/useIsArticleRecommendationsEnabledWhileSunset'
import { mockStore } from 'utils/testing'

describe('useIsArticleRecommendationsEnabledWhileSunset', () => {
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

    describe('when merchant has non-Shopify integrations', () => {
        it('should return enabled true when merchant has BigCommerce integration', () => {
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

            expect(result.current.enabled).toBe(true)
        })

        it('should return enabled true when merchant has Magento2 integration', () => {
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

            expect(result.current.enabled).toBe(true)
        })

        it('should return enabled true when merchant has both BigCommerce and Magento2', () => {
            const store = createStoreWithIntegrationsAndAccount({
                integrations: [
                    { id: 1, type: IntegrationType.BigCommerce },
                    { id: 2, type: IntegrationType.Magento2 },
                ],
                accountCreatedDate: '2026-01-01T00:00:00Z', // New merchant
            })

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                {
                    wrapper: ({ children }) => wrapper({ children, store }),
                },
            )

            expect(result.current.enabled).toBe(true)
        })
    })

    describe('when merchant only has Shopify integrations', () => {
        describe('for old merchants (created before sunset date)', () => {
            it('should return enabled true when account was created before sunset date', () => {
                const oldDate = new Date(
                    CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE,
                )
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

                expect(result.current.enabled).toBe(true)
            })

            it('should return enabled true when account was created exactly on sunset date', () => {
                const store = createStoreWithIntegrationsAndAccount({
                    integrations: [{ id: 1, type: IntegrationType.Shopify }],
                    accountCreatedDate:
                        CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE.toISOString(),
                })

                const { result } = renderHook(
                    () => useIsArticleRecommendationsEnabledWhileSunset(),
                    {
                        wrapper: ({ children }) => wrapper({ children, store }),
                    },
                )

                expect(result.current.enabled).toBe(true)
            })
        })

        describe('for new merchants (created after sunset date)', () => {
            it('should return enabled false when account was created after sunset date', () => {
                const newDate = new Date(
                    CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE,
                )
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

                expect(result.current.enabled).toBe(false)
            })

            it('should return enabled false for recent accounts with only Shopify', () => {
                const store = createStoreWithIntegrationsAndAccount({
                    integrations: [{ id: 1, type: IntegrationType.Shopify }],
                    accountCreatedDate: '2026-01-01T00:00:00Z',
                })

                const { result } = renderHook(
                    () => useIsArticleRecommendationsEnabledWhileSunset(),
                    {
                        wrapper: ({ children }) => wrapper({ children, store }),
                    },
                )

                expect(result.current.enabled).toBe(false)
            })
        })
    })

    describe('when merchant has no integrations', () => {
        it('should return enabled true for old merchants without integrations', () => {
            const oldDate = new Date(CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE)
            oldDate.setFullYear(oldDate.getFullYear() - 1) // One year before sunset

            const store = createStoreWithIntegrationsAndAccount({
                integrations: [],
                accountCreatedDate: oldDate.toISOString(),
            })

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                {
                    wrapper: ({ children }) => wrapper({ children, store }),
                },
            )

            expect(result.current.enabled).toBe(true)
        })

        it('should return enabled false for new merchants without integrations', () => {
            const newDate = new Date(CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE)
            newDate.setMonth(newDate.getMonth() + 1) // One month after sunset

            const store = createStoreWithIntegrationsAndAccount({
                integrations: [],
                accountCreatedDate: newDate.toISOString(),
            })

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                {
                    wrapper: ({ children }) => wrapper({ children, store }),
                },
            )

            expect(result.current.enabled).toBe(false)
        })
    })

    describe('when merchant has other integration types', () => {
        it('should ignore non-ecommerce integrations', () => {
            const newDate = new Date(CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE)
            newDate.setDate(newDate.getDate() + 10)

            const store = createStoreWithIntegrationsAndAccount({
                integrations: [
                    { id: 1, type: 'email' },
                    { id: 2, type: 'instagram' },
                    { id: 3, type: 'facebook' },
                ],
                accountCreatedDate: newDate.toISOString(),
            })

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                {
                    wrapper: ({ children }) => wrapper({ children, store }),
                },
            )

            expect(result.current.enabled).toBe(false)
        })

        it('should return enabled true when has non-Shopify ecommerce integration mixed with others', () => {
            const newDate = new Date(CHAT_ARTICLE_RECOMMENDATION_SUNSET_DATE)
            newDate.setDate(newDate.getDate() + 10)

            const store = createStoreWithIntegrationsAndAccount({
                integrations: [
                    { id: 1, type: 'email' },
                    { id: 2, type: IntegrationType.BigCommerce },
                    { id: 3, type: 'facebook' },
                ],
                accountCreatedDate: newDate.toISOString(),
            })

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                {
                    wrapper: ({ children }) => wrapper({ children, store }),
                },
            )

            expect(result.current.enabled).toBe(true)
        })
    })

    describe('edge cases', () => {
        it('should handle invalid account creation date gracefully', () => {
            const store = createStoreWithIntegrationsAndAccount({
                integrations: [],
                accountCreatedDate: 'invalid-date',
            })

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                {
                    wrapper: ({ children }) => wrapper({ children, store }),
                },
            )

            // Invalid date would be parsed as NaN, which makes isNewMerchant false
            // Since no non-Shopify integrations and not new merchant, should be enabled
            expect(result.current.enabled).toBe(true)
        })

        it('should handle missing account creation date', () => {
            const store = mockStore({
                currentAccount: fromJS({}),
                integrations: fromJS({
                    integrations: [],
                }),
            })

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                {
                    wrapper: ({ children }) => wrapper({ children, store }),
                },
            )

            // Missing date would be parsed as NaN, which makes isNewMerchant false
            // Since no non-Shopify integrations and not new merchant, should be enabled
            expect(result.current.enabled).toBe(true)
        })

        it('should handle empty integrations array', () => {
            const store = mockStore({
                currentAccount: fromJS({
                    created_datetime: '2026-01-01T00:00:00Z',
                }),
                integrations: fromJS({
                    integrations: [],
                }),
            })

            const { result } = renderHook(
                () => useIsArticleRecommendationsEnabledWhileSunset(),
                {
                    wrapper: ({ children }) => wrapper({ children, store }),
                },
            )

            // No integrations and new merchant, should be disabled
            expect(result.current.enabled).toBe(false)
        })
    })
})
