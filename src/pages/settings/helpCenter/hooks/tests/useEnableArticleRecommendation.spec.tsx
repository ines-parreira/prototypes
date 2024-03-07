import React from 'react'
import {Provider} from 'react-redux'
import {renderHook} from '@testing-library/react-hooks'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {waitFor} from '@testing-library/react'
import {HelpCenter} from 'models/helpCenter/types'
import {RootState, StoreDispatch} from 'state/types'

import {
    updateSelfServiceConfiguration,
    fetchSelfServiceConfiguration,
} from 'models/selfServiceConfiguration/resources'

import {getHasAutomate} from 'state/billing/selectors'
import {useEnableArticleRecommendation} from '../useEnableArticleRecommendation'

jest.mock('state/billing/selectors')
jest.mock('models/selfServiceConfiguration/resources')

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
            {type: 'gorgias_chat', meta: {app_id: '1', shop_name: 'test-shop'}},
            {type: 'gorgias_chat', meta: {app_id: '2', shop_name: 'test-shop'}},
            {
                id: 1,
                type: 'shopify',
                meta: {shop_name: 'test-shop'},
            },
        ],
    }),
}

const getDependencyWrapper = (state = defaultState) => {
    const dependencyWrapper: React.ComponentType<any> = ({
        children,
    }: {
        children: Element
    }) => <Provider store={mockStore(state)}>{children}</Provider>

    return dependencyWrapper
}

describe('useEnableArticleRecommendation', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('Should call updateSelfServiceConfiguration', async () => {
        ;(getHasAutomate as unknown as jest.Mock).mockReturnValue(true)
        ;(fetchSelfServiceConfiguration as jest.Mock).mockResolvedValue({
            article_recommendation_help_center_id: null,
        })

        const {result} = renderHook(() => useEnableArticleRecommendation(), {
            wrapper: getDependencyWrapper(),
        })
        void result.current({id: 999, shop_name: 'test-shop'} as HelpCenter)

        await waitFor(() => {
            expect(fetchSelfServiceConfiguration).toHaveBeenCalledWith(1)
        })
        expect(updateSelfServiceConfiguration).toHaveBeenCalledWith(
            expect.objectContaining({
                article_recommendation_help_center_id: 999,
            })
        )
    })

    it('Should not call if there is already a help-center with the same store', async () => {
        ;(getHasAutomate as unknown as jest.Mock).mockReturnValue(true)

        const {result} = renderHook(useEnableArticleRecommendation, {
            wrapper: getDependencyWrapper({
                ...defaultState,
                entities: {
                    helpCenter: {
                        helpCenters: {
                            helpCentersById: {
                                '28': {
                                    id: 28,
                                    shop_name: 'test-shop',
                                    type: 'faq',
                                },
                            },
                        },
                    },
                } as any,
            }),
        })

        void result.current({
            id: 999,
            shop_name: 'test-shop',
            type: 'faq',
        } as HelpCenter)

        await waitFor(() => {
            expect(fetchSelfServiceConfiguration).not.toHaveBeenCalled()
        })
        expect(updateSelfServiceConfiguration).not.toHaveBeenCalled()
    })

    it('Should not call if Automate is not enabled', async () => {
        ;(getHasAutomate as unknown as jest.Mock).mockReturnValue(false)

        const {result} = renderHook(useEnableArticleRecommendation, {
            wrapper: getDependencyWrapper(),
        })
        void result.current({id: 999, shop_name: 'test-shop'} as HelpCenter)

        await waitFor(() => {
            expect(fetchSelfServiceConfiguration).not.toHaveBeenCalled()
        })
        expect(updateSelfServiceConfiguration).not.toHaveBeenCalled()
    })

    it('Should not call if there is already a article_recommendation_help_center_id', async () => {
        ;(getHasAutomate as unknown as jest.Mock).mockReturnValue(true)
        ;(fetchSelfServiceConfiguration as jest.Mock).mockResolvedValue({
            article_recommendation_help_center_id: 2,
        })

        const {result} = renderHook(useEnableArticleRecommendation, {
            wrapper: getDependencyWrapper(),
        })
        void result.current({id: 999, shop_name: 'test-shop'} as HelpCenter)

        await waitFor(() => {
            expect(fetchSelfServiceConfiguration).toHaveBeenCalledWith(1)
        })
        expect(updateSelfServiceConfiguration).not.toHaveBeenCalled()
    })

    it('Should not call if they are not related to the same shop', async () => {
        ;(getHasAutomate as unknown as jest.Mock).mockReturnValue(true)

        const {result} = renderHook(useEnableArticleRecommendation, {
            wrapper: getDependencyWrapper(),
        })
        void result.current({
            id: 999,
            shop_name: 'test-shopopopop',
        } as HelpCenter)

        await waitFor(() => {
            expect(fetchSelfServiceConfiguration).not.toHaveBeenCalled()
        })
        expect(fetchSelfServiceConfiguration).not.toHaveBeenCalled()
    })
})
