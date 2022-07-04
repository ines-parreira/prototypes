import React from 'react'
import {Provider} from 'react-redux'
import {renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {waitFor} from '@testing-library/react'
import {HelpCenter} from 'models/helpCenter/types'
import {RootState, StoreDispatch} from 'state/types'

import {
    createChatHelpCenterConfiguration,
    fetchChatHelpCenterConfiguration,
} from 'models/selfServiceConfiguration/resources'

import {getHasAutomationAddOn} from 'state/billing/selectors'
import {useEnableArticleRecommendation} from '../useEnableArticleRecommendation'

jest.mock('state/billing/selectors')
jest.mock('models/selfServiceConfiguration/resources')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: {helpCentersById: {}},
        },
    } as any,
    integrations: fromJS({
        integrations: [
            {type: 'gorgias_chat', meta: {app_id: '1', shop_name: 'test-shop'}},
            {type: 'gorgias_chat', meta: {app_id: '2', shop_name: 'test-shop'}},
        ],
    }),
}
const notify = jest.fn()

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

    it('Should call createChatHelpCenterConfiguration', async () => {
        ;(getHasAutomationAddOn as jest.Mock).mockReturnValue(true)
        ;(fetchChatHelpCenterConfiguration as jest.Mock).mockRejectedValue({
            isAxiosError: true,
            response: {status: 404},
        })
        ;(createChatHelpCenterConfiguration as jest.Mock).mockResolvedValue(
            true
        )

        const {result} = renderHook(
            () => useEnableArticleRecommendation(notify),
            {
                wrapper: getDependencyWrapper(),
            }
        )
        void result.current({id: 999, shop_name: 'test-shop'} as HelpCenter)

        await waitFor(() => {
            expect(fetchChatHelpCenterConfiguration).toHaveBeenCalledWith(1)
            expect(fetchChatHelpCenterConfiguration).toHaveBeenCalledWith(2)
        })
        expect(createChatHelpCenterConfiguration).toHaveBeenCalledWith({
            chatApplicationId: 1,
            helpCenterId: 999,
        })
        expect(createChatHelpCenterConfiguration).toHaveBeenCalledWith({
            chatApplicationId: 2,
            helpCenterId: 999,
        })
        expect(notify).toHaveBeenCalledWith({
            message:
                'Activated the article recommendation for 2 chat integrations',
            status: 'success',
        })
    })
    it('Should not call if there is multiple help-centers', async () => {
        ;(getHasAutomationAddOn as jest.Mock).mockReturnValue(true)

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

        void result.current({id: 999} as HelpCenter)

        await waitFor(() => {
            expect(fetchChatHelpCenterConfiguration).not.toHaveBeenCalled()
        })
        expect(createChatHelpCenterConfiguration).not.toHaveBeenCalled()
    })
    it('Not call if AutomationAddOn is not enabled', async () => {
        ;(getHasAutomationAddOn as jest.Mock).mockReturnValue(false)

        const {result} = renderHook(useEnableArticleRecommendation, {
            wrapper: getDependencyWrapper(),
        })
        void result.current({id: 999, shop_name: 'test-shop'} as HelpCenter)

        await waitFor(() => {
            expect(fetchChatHelpCenterConfiguration).not.toHaveBeenCalled()
        })
        expect(createChatHelpCenterConfiguration).not.toHaveBeenCalled()
    })
    it('Should not call if there is already a chatHelpCenterConfiguration', async () => {
        ;(getHasAutomationAddOn as jest.Mock).mockReturnValue(true)
        ;(fetchChatHelpCenterConfiguration as jest.Mock).mockResolvedValue(true)

        const {result} = renderHook(useEnableArticleRecommendation, {
            wrapper: getDependencyWrapper(),
        })
        void result.current({id: 999, shop_name: 'test-shop'} as HelpCenter)

        await waitFor(() => {
            expect(fetchChatHelpCenterConfiguration).toHaveBeenCalledWith(1)
        })
        expect(createChatHelpCenterConfiguration).not.toHaveBeenCalled()
    })
    it('Should not call if they are not related to the same shop', async () => {
        ;(getHasAutomationAddOn as jest.Mock).mockReturnValue(true)

        const {result} = renderHook(useEnableArticleRecommendation, {
            wrapper: getDependencyWrapper(),
        })
        void result.current({
            id: 999,
            shop_name: 'test-shopopopop',
        } as HelpCenter)

        await waitFor(() => {
            expect(fetchChatHelpCenterConfiguration).not.toHaveBeenCalledWith(1)
        })
        expect(createChatHelpCenterConfiguration).not.toHaveBeenCalled()
    })
})
