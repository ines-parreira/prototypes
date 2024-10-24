import {waitFor} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'

import {AIArticle, HelpCenter} from 'models/helpCenter/types'
import {StoreIntegration} from 'models/integration/types'
import {useGetAIArticles} from 'pages/settings/helpCenter/hooks/useGetAIArticles'
import {NonEmptyArray} from 'types'
import {assumeMock} from 'utils/testing'

import {useFirstStoreAndHelpCenterWithTopQuestions} from '../useFirstStoreAndHelpCenterWithTopQuestions'
import {useHasEmailToStoreConnection} from '../useHasEmailToStoreConnection'
import {StoreWithHelpCenters} from '../useTopQuestionsStoresWithHelpCenters'

jest.mock('../useHasEmailToStoreConnection')
const mockUseHasEmailToStoreConnection = assumeMock(
    useHasEmailToStoreConnection
)

jest.mock('pages/settings/helpCenter/hooks/useGetAIArticles')
const mockUseConditionalGetAIArticles = assumeMock(useGetAIArticles)

const mockArticles: AIArticle[] = [
    {
        key: 'ai_article_1',
        title: 'AI Article 1',
        html_content: '<p>AI Article 1 content</p>',
        excerpt: 'AI Article 1 excerpt',
        category: 'AI',
        score: 0.5,
        related_tickets_count: 150,
        batch_datetime: '2024-02-06T13:30:00Z',
        review_action: undefined,
        reviews: [],
    },
    {
        key: 'ai_article_2',
        title: 'AI Article 2',
        html_content: '<p>AI Article 2 content</p>',
        excerpt: 'AI Article 2 excerpt',
        category: 'AI',
        score: 0.5,
        related_tickets_count: 140,
        batch_datetime: '2024-02-06T13:30:00Z',
        review_action: undefined,
        reviews: [],
    },
    {
        key: 'ai_article_3',
        title: 'AI Article 3',
        html_content: '<p>AI Article 3 content</p>',
        excerpt: 'AI Article 3 excerpt',
        category: 'AI',
        score: 0.5,
        related_tickets_count: 130,
        batch_datetime: '2024-02-06T13:30:00Z',
        review_action: undefined,
        reviews: [],
    },
    {
        key: 'ai_article_4',
        title: 'AI Article 4',
        html_content: '<p>AI Article 4 content</p>',
        excerpt: 'AI Article 4 excerpt',
        category: 'AI',
        score: 0.5,
        related_tickets_count: 120,
        batch_datetime: '2024-02-06T13:30:00Z',
        review_action: undefined,
        reviews: [],
    },
]

const storesWithHelpCentersFixture: StoreWithHelpCenters[] = [
    {
        store: {id: 1, name: 'Store 1'} as StoreIntegration,
        helpCenters: [
            {id: 11, name: 'Help Center 11'},
            {id: 12, name: 'Help Center 12'},
        ] as unknown as NonEmptyArray<HelpCenter>,
    },
    {
        store: {id: 2, name: 'Store 2'} as StoreIntegration,
        helpCenters: [
            {id: 21, name: 'Help Center 21'},
            {id: 22, name: 'Help Center 22'},
            {id: 23, name: 'Help Center 23'},
        ] as unknown as NonEmptyArray<HelpCenter>,
    },
    {
        store: {id: 3, name: 'Store 3'} as StoreIntegration,
        helpCenters: [
            {id: 31, name: 'Help Center 31'},
        ] as unknown as NonEmptyArray<HelpCenter>,
    },
]

describe('useFirstStoreAndHelpCenterWithTopQuestions', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        mockUseHasEmailToStoreConnection.mockReturnValue({
            hasEmailToStoreConnection: true,
            isLoading: false,
        })

        mockUseConditionalGetAIArticles.mockImplementation(
            ({helpCenterId, storeIntegrationId, enabled}) => {
                if (enabled === false) {
                    return {isLoading: false, fetchedArticles: null}
                }

                if (storeIntegrationId === 2 && helpCenterId === 22) {
                    return {isLoading: false, fetchedArticles: mockArticles}
                }

                return {isLoading: false, fetchedArticles: []}
            }
        )
    })

    it('finds the first store and help center with top questions', async () => {
        const {result} = renderHook(() =>
            useFirstStoreAndHelpCenterWithTopQuestions(
                storesWithHelpCentersFixture,
                true
            )
        )

        await waitFor(() => {
            expect(mockUseConditionalGetAIArticles.mock.calls).toEqual([
                [
                    {
                        helpCenterId: 11,
                        locale: 'en-US',
                        storeIntegrationId: 1,
                    },
                ],
                [
                    {
                        helpCenterId: 12,
                        locale: 'en-US',
                        storeIntegrationId: 1,
                    },
                ],
                [
                    {
                        helpCenterId: 21,
                        locale: 'en-US',
                        storeIntegrationId: 2,
                    },
                ],
                [
                    {
                        helpCenterId: 22,
                        locale: 'en-US',
                        storeIntegrationId: 2,
                    },
                ],
                [
                    {
                        helpCenterId: 22,
                        locale: 'en-US',
                        storeIntegrationId: 2,
                        enabled: false,
                    },
                ],
            ])
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                isLoading: false,
                firstMatchingStoreAndHelpCenter: {
                    firstMatchingStore: storesWithHelpCentersFixture[1].store,
                    firstMatchingHelpCenter:
                        storesWithHelpCentersFixture[1].helpCenters[1],
                },
            })
        })
    })

    it('returns nothing if no store and help-center have top questions', async () => {
        mockUseConditionalGetAIArticles.mockReturnValue({
            fetchedArticles: [],
            isLoading: false,
        })

        const {result} = renderHook(() =>
            useFirstStoreAndHelpCenterWithTopQuestions(
                storesWithHelpCentersFixture,
                true
            )
        )

        await waitFor(() => {
            expect(mockUseConditionalGetAIArticles.mock.calls).toEqual([
                [{helpCenterId: 11, locale: 'en-US', storeIntegrationId: 1}],
                [{helpCenterId: 12, locale: 'en-US', storeIntegrationId: 1}],
                [{helpCenterId: 21, locale: 'en-US', storeIntegrationId: 2}],
                [{helpCenterId: 22, locale: 'en-US', storeIntegrationId: 2}],
                [{helpCenterId: 23, locale: 'en-US', storeIntegrationId: 2}],
                [{helpCenterId: 31, locale: 'en-US', storeIntegrationId: 3}],
                [
                    {
                        enabled: false,
                        helpCenterId: null,
                        locale: 'en-US',
                        storeIntegrationId: null,
                    },
                ],
            ])
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                isLoading: false,
                firstMatchingStoreAndHelpCenter: undefined,
            })
        })
    })

    it('does nothing if disabled and starts work if enabled later', async () => {
        const {rerender, result} = renderHook(
            ({enabled}: {enabled: boolean}) =>
                useFirstStoreAndHelpCenterWithTopQuestions(
                    storesWithHelpCentersFixture,
                    enabled
                ),
            {initialProps: {enabled: false}}
        )

        await waitFor(() => {
            expect(mockUseConditionalGetAIArticles.mock.calls).toEqual([
                [
                    {
                        helpCenterId: 11,
                        locale: 'en-US',
                        storeIntegrationId: 1,
                        enabled: false,
                    },
                ],
            ])
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                isLoading: false,
                firstMatchingStoreAndHelpCenter: undefined,
            })
        })

        mockUseConditionalGetAIArticles.mockClear()

        rerender({enabled: true})

        await waitFor(() => {
            expect(mockUseConditionalGetAIArticles.mock.calls).toEqual([
                [
                    {
                        helpCenterId: 11,
                        locale: 'en-US',
                        storeIntegrationId: 1,
                    },
                ],
                [
                    {
                        helpCenterId: 12,
                        locale: 'en-US',
                        storeIntegrationId: 1,
                    },
                ],
                [
                    {
                        helpCenterId: 21,
                        locale: 'en-US',
                        storeIntegrationId: 2,
                    },
                ],
                [
                    {
                        helpCenterId: 22,
                        locale: 'en-US',
                        storeIntegrationId: 2,
                    },
                ],
                [
                    {
                        helpCenterId: 22,
                        locale: 'en-US',
                        storeIntegrationId: 2,
                        enabled: false,
                    },
                ],
            ])
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                isLoading: false,
                firstMatchingStoreAndHelpCenter: {
                    firstMatchingStore: storesWithHelpCentersFixture[1].store,
                    firstMatchingHelpCenter:
                        storesWithHelpCentersFixture[1].helpCenters[1],
                },
            })
        })
    })

    it('does nothing if it has no store', async () => {
        const {result} = renderHook(() =>
            useFirstStoreAndHelpCenterWithTopQuestions([], true)
        )

        await waitFor(() => {
            expect(mockUseConditionalGetAIArticles.mock.calls).toEqual([
                [
                    {
                        enabled: false,
                        helpCenterId: null,
                        locale: 'en-US',
                        storeIntegrationId: null,
                    },
                ],
            ])
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                isLoading: false,
                firstMatchingStoreAndHelpCenter: undefined,
            })
        })
    })

    it('returns isLoading true if email to store connection is loading', async () => {
        mockUseHasEmailToStoreConnection.mockReturnValue({
            hasEmailToStoreConnection: true,
            isLoading: true,
        })

        const {result} = renderHook(() =>
            useFirstStoreAndHelpCenterWithTopQuestions(
                storesWithHelpCentersFixture,
                true
            )
        )

        await waitFor(() => {
            expect(mockUseConditionalGetAIArticles.mock.calls).toEqual([
                [
                    {
                        enabled: false,
                        helpCenterId: 11,
                        locale: 'en-US',
                        storeIntegrationId: 1,
                    },
                ],
            ])
        })

        expect(result.current).toEqual({
            isLoading: true,
            firstMatchingStoreAndHelpCenter: undefined,
        })
    })

    it('returns isLoading true if useConditionalGetAIArticles is loading', async () => {
        mockUseConditionalGetAIArticles.mockReturnValue({
            fetchedArticles: [],
            isLoading: true,
        })

        const {result} = renderHook(() =>
            useFirstStoreAndHelpCenterWithTopQuestions(
                storesWithHelpCentersFixture,
                true
            )
        )

        await waitFor(() => {
            expect(mockUseConditionalGetAIArticles.mock.calls).toEqual([
                [
                    {
                        helpCenterId: 11,
                        locale: 'en-US',
                        storeIntegrationId: 1,
                    },
                ],
            ])
        })

        expect(result.current).toEqual({
            isLoading: true,
            firstMatchingStoreAndHelpCenter: undefined,
        })
    })

    it('does not stop searching even if it encounters stores with no connected email', async () => {
        mockUseHasEmailToStoreConnection.mockImplementation(
            (storeIntegrationId) =>
                storeIntegrationId === 2
                    ? {isLoading: false, hasEmailToStoreConnection: false}
                    : {
                          hasEmailToStoreConnection: true,
                          isLoading: false,
                      }
        )

        mockUseConditionalGetAIArticles.mockImplementation(
            ({helpCenterId, storeIntegrationId, enabled}) => {
                if (enabled === false) {
                    return {isLoading: false, fetchedArticles: null}
                }

                if (storeIntegrationId === 3 && helpCenterId === 31) {
                    return {isLoading: false, fetchedArticles: mockArticles}
                }

                return {isLoading: false, fetchedArticles: []}
            }
        )

        const {result} = renderHook(() =>
            useFirstStoreAndHelpCenterWithTopQuestions(
                storesWithHelpCentersFixture,
                true
            )
        )

        await waitFor(() => {
            expect(mockUseConditionalGetAIArticles.mock.calls).toEqual([
                [
                    {
                        helpCenterId: 11,
                        locale: 'en-US',
                        storeIntegrationId: 1,
                    },
                ],
                [
                    {
                        helpCenterId: 12,
                        locale: 'en-US',
                        storeIntegrationId: 1,
                    },
                ],
                [
                    {
                        helpCenterId: 21,
                        locale: 'en-US',
                        storeIntegrationId: 2,
                        enabled: false, // because no email to store connection
                    },
                ],
                [
                    {
                        helpCenterId: 22,
                        locale: 'en-US',
                        storeIntegrationId: 2,
                        enabled: false, // because no email to store connection
                    },
                ],
                [
                    {
                        helpCenterId: 23,
                        locale: 'en-US',
                        storeIntegrationId: 2,
                        enabled: false, // because no email to store connection
                    },
                ],
                [
                    {
                        helpCenterId: 31,
                        locale: 'en-US',
                        storeIntegrationId: 3,
                    },
                ],
                [
                    {
                        helpCenterId: 31,
                        locale: 'en-US',
                        storeIntegrationId: 3,
                        enabled: false,
                    },
                ],
            ])
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                isLoading: false,
                firstMatchingStoreAndHelpCenter: {
                    firstMatchingStore: storesWithHelpCentersFixture[2].store,
                    firstMatchingHelpCenter:
                        storesWithHelpCentersFixture[2].helpCenters[0],
                },
            })
        })
    })

    it('does not stop searching even if it encounters store with no connected email at the beginning', async () => {
        mockUseHasEmailToStoreConnection.mockImplementation(
            (storeIntegrationId) =>
                storeIntegrationId === 1
                    ? {isLoading: false, hasEmailToStoreConnection: false}
                    : {
                          hasEmailToStoreConnection: true,
                          isLoading: false,
                      }
        )

        mockUseConditionalGetAIArticles.mockImplementation(
            ({helpCenterId, storeIntegrationId, enabled}) => {
                if (enabled === false) {
                    return {isLoading: false, fetchedArticles: null}
                }

                if (storeIntegrationId === 3 && helpCenterId === 31) {
                    return {isLoading: false, fetchedArticles: mockArticles}
                }

                return {isLoading: false, fetchedArticles: []}
            }
        )

        const {result} = renderHook(() =>
            useFirstStoreAndHelpCenterWithTopQuestions(
                storesWithHelpCentersFixture,
                true
            )
        )

        await waitFor(() => {
            expect(mockUseConditionalGetAIArticles.mock.calls).toEqual([
                [
                    {
                        helpCenterId: 11,
                        locale: 'en-US',
                        storeIntegrationId: 1,
                        enabled: false, // because no email to store connection
                    },
                ],
                [
                    {
                        helpCenterId: 12,
                        locale: 'en-US',
                        storeIntegrationId: 1,
                        enabled: false, // because no email to store connection
                    },
                ],
                [
                    {
                        helpCenterId: 21,
                        locale: 'en-US',
                        storeIntegrationId: 2,
                    },
                ],
                [
                    {
                        helpCenterId: 22,
                        locale: 'en-US',
                        storeIntegrationId: 2,
                    },
                ],
                [
                    {
                        helpCenterId: 23,
                        locale: 'en-US',
                        storeIntegrationId: 2,
                    },
                ],
                [
                    {
                        helpCenterId: 31,
                        locale: 'en-US',
                        storeIntegrationId: 3,
                    },
                ],
                [
                    {
                        helpCenterId: 31,
                        locale: 'en-US',
                        storeIntegrationId: 3,
                        enabled: false,
                    },
                ],
            ])
        })

        await waitFor(() => {
            expect(result.current).toEqual({
                isLoading: false,
                firstMatchingStoreAndHelpCenter: {
                    firstMatchingStore: storesWithHelpCentersFixture[2].store,
                    firstMatchingHelpCenter:
                        storesWithHelpCentersFixture[2].helpCenters[0],
                },
            })
        })
    })
})
