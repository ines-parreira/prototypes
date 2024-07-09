import React from 'react'
import {Provider} from 'react-redux'
import {renderHook} from '@testing-library/react-hooks'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {waitFor} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {HelpCenter} from 'models/helpCenter/types'
import {RootState, StoreDispatch} from 'state/types'

import {
    updateSelfServiceConfigurationSSP,
    fetchSelfServiceConfigurationSSP,
} from 'models/selfServiceConfiguration/resources'

import {getHasAutomate} from 'state/billing/selectors'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {useEnableArticleRecommendation} from '../useEnableArticleRecommendation'

jest.mock('state/billing/selectors')
jest.mock('models/selfServiceConfiguration/resources')
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
                meta: {app_id: '1', shop_name: 'test-shop'},
            },
            {
                type: 'gorgias_chat',
                name: 'test-shop',
                meta: {app_id: '2', shop_name: 'test-shop'},
            },
            {
                id: 1,
                type: 'shopify',
                name: 'test-shop',
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
    })

    it('Should call updateSelfServiceConfiguration', async () => {
        ;(getHasAutomate as unknown as jest.Mock).mockReturnValue(true)
        ;(fetchSelfServiceConfigurationSSP as jest.Mock).mockResolvedValue({
            articleRecommendationHelpCenterId: null,
        })

        const {result} = renderHook(() => useEnableArticleRecommendation(), {
            wrapper: getDependencyWrapper(),
        })
        void result.current({id: 999, shop_name: 'test-shop'} as HelpCenter)

        await waitFor(() => {
            expect(fetchSelfServiceConfigurationSSP).toHaveBeenCalledWith(
                'test-shop',
                'shopify'
            )
        })
        expect(updateSelfServiceConfigurationSSP).toHaveBeenCalledWith(
            expect.objectContaining({
                articleRecommendationHelpCenterId: 999,
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
                                '28': {id: 28, shop_name: 'test-shop'},
                            },
                        },
                    },
                } as any,
            }),
        })

        void result.current({id: 999, shop_name: 'test-shop'} as HelpCenter)

        await waitFor(() => {
            expect(fetchSelfServiceConfigurationSSP).not.toHaveBeenCalled()
        })
        expect(updateSelfServiceConfigurationSSP).not.toHaveBeenCalled()
    })

    it('Should not call if Automate is not enabled', async () => {
        ;(getHasAutomate as unknown as jest.Mock).mockReturnValue(false)

        const {result} = renderHook(useEnableArticleRecommendation, {
            wrapper: getDependencyWrapper(),
        })
        void result.current({id: 999, shop_name: 'test-shop'} as HelpCenter)

        await waitFor(() => {
            expect(fetchSelfServiceConfigurationSSP).not.toHaveBeenCalled()
        })
        expect(updateSelfServiceConfigurationSSP).not.toHaveBeenCalled()
    })

    it('Should not call if there is already a articleRecommendationHelpCenterId', async () => {
        ;(getHasAutomate as unknown as jest.Mock).mockReturnValue(true)
        ;(fetchSelfServiceConfigurationSSP as jest.Mock).mockResolvedValue({
            articleRecommendationHelpCenterId: 2,
        })

        const {result} = renderHook(useEnableArticleRecommendation, {
            wrapper: getDependencyWrapper(),
        })
        void result.current({id: 999, shop_name: 'test-shop'} as HelpCenter)

        await waitFor(() => {
            expect(fetchSelfServiceConfigurationSSP).toHaveBeenCalledWith(
                'test-shop',
                'shopify'
            )
        })
        expect(updateSelfServiceConfigurationSSP).not.toHaveBeenCalled()
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
            expect(fetchSelfServiceConfigurationSSP).not.toHaveBeenCalled()
        })
        expect(fetchSelfServiceConfigurationSSP).not.toHaveBeenCalled()
    })
})
