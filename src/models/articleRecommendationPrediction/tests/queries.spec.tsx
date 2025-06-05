import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

import {
    useArticleRecommendationPredictions,
    useUpdateArticleRecommendationPredictions,
} from '../queries'
import {
    articleRecommendationPredictionsResponseFixture,
    updateArticleRecommendationPredictionsResponseFixture,
} from './article-recommendation-prediction.fixture'

let mockedServer: MockAdapter
const queryClient = mockQueryClient()
const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('queries', () => {
    beforeAll(() => {
        mockedServer = new MockAdapter(axios)
    })
    beforeEach(() => {
        queryClient.clear()
        mockedServer.reset()
    })

    describe('useArticleRecommendationPredictions', () => {
        it('should return correct data on success', async () => {
            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/article-recommendation\/predictions/)
                .reply(200, articleRecommendationPredictionsResponseFixture)

            const { result } = renderHook(
                () =>
                    useArticleRecommendationPredictions({
                        page: 1,
                        shopName: 'my-shop',
                        shopType: 'shopify',
                        helpCenterId: 1,
                    }),
                {
                    wrapper,
                },
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(
                articleRecommendationPredictionsResponseFixture,
            )
        })

        // TODO(React18): Fix this flaky test
        it.skip('should not return data when helpCenterId is not provided', async () => {
            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/article-recommendation\/predictions/)
                .reply(200, articleRecommendationPredictionsResponseFixture)

            const { result } = renderHook(
                () =>
                    useArticleRecommendationPredictions({
                        page: 1,
                        shopName: 'my-shop',
                        shopType: 'shopify',
                        helpCenterId: 1,
                    }),
                {
                    wrapper,
                },
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(false))
            expect(result.current.data).toBe(undefined)
        })
    })

    describe('useUpdateArticleRecommendationPredictions', () => {
        it('should return correct data on success', async () => {
            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onPatch(/article-recommendation\/predictions/)
                .reply(
                    200,
                    updateArticleRecommendationPredictionsResponseFixture,
                )

            const { result } = renderHook(
                () => useUpdateArticleRecommendationPredictions(),
                {
                    wrapper,
                },
            )

            act(() => {
                result.current.mutate([
                    updateArticleRecommendationPredictionsResponseFixture.id,
                ])
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })
            expect(result.current.data?.data).toEqual(
                updateArticleRecommendationPredictionsResponseFixture,
            )
        })
    })
})
