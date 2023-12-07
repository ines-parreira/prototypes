import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import MockAdapter from 'axios-mock-adapter'
import {renderHook} from '@testing-library/react-hooks'
import axios from 'axios'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {useArticleRecommendationPredictions} from '../queries'
import {articleRecommendationPredictionsResponseFixture} from './article-recommendation-prediction.fixture'

let mockedServer: MockAdapter
const queryClient = mockQueryClient()
const wrapper = ({children}: any) => (
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

            const {result, waitFor} = renderHook(
                () =>
                    useArticleRecommendationPredictions({
                        page: 1,
                        shopName: 'my-shop',
                        shopType: 'shopify',
                        helpCenterId: 1,
                    }),
                {
                    wrapper,
                }
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(
                articleRecommendationPredictionsResponseFixture
            )
        })
        it('should not return data when helpCenterId is not provided', async () => {
            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/article-recommendation\/predictions/)
                .reply(200, articleRecommendationPredictionsResponseFixture)

            const {result, waitFor} = renderHook(
                () =>
                    useArticleRecommendationPredictions({
                        page: 1,
                        shopName: 'my-shop',
                        shopType: 'shopify',
                        helpCenterId: 1,
                    }),
                {
                    wrapper,
                }
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(false))
            expect(result.current.data).toBe(undefined)
        })
    })
})
