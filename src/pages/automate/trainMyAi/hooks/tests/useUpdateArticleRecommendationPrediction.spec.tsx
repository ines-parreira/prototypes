import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {QueryClientProvider} from '@tanstack/react-query'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {RootState, StoreDispatch} from 'state/types'
import useUpdateArticleRecommendationPrediction from '../useUpdateArticleRecommendationPrediction'

const mockStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>([
    thunk,
])

const queryClient = mockQueryClient()
const wrapper = ({children}: any) => (
    <Provider store={mockStore({})}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </Provider>
)

describe('useUpdateArticleRecommendationPrediction', () => {
    it('should return hook without errors', () => {
        const {result} = renderHook(
            () =>
                useUpdateArticleRecommendationPrediction({
                    page: 1,
                    helpCenterId: 1,
                    shopName: 'shop-name',
                    shopType: 'shop-type',
                }),
            {
                wrapper,
            }
        )

        expect(result.current).toMatchObject({})
    })
})
