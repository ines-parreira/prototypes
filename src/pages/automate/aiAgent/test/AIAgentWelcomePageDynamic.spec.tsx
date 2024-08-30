import React from 'react'
import {render, screen} from '@testing-library/react'
import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {useHelpCentersArticleCount} from '../../common/hooks/useHelpCentersArticleCount'
import {AIAgentWelcomePageDynamic} from '../AIAgentWelcomePageDynamic'
import {AIAgentWelcomePageView} from '../components/AIAgentWelcomePageView/AIAgentWelcomePageView'
import {useHasEmailToStoreConnection} from '../../common/components/TopQuestions/useHasEmailToStoreConnection'
import useSelfServiceStoreIntegration from '../../common/hooks/useSelfServiceStoreIntegration'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterList', () => ({
    useHelpCenterList: jest.fn(),
}))

jest.mock('../../common/hooks/useHelpCentersArticleCount')

jest.mock(
    '../components/AIAgentWelcomePageView/AIAgentWelcomePageView',
    () => ({
        AIAgentWelcomePageView: jest.fn(() => (
            <div>ai-agent-welcome-page-view-component-mock</div>
        )),
    })
)

jest.mock('../../common/components/TopQuestions/useHasEmailToStoreConnection')

jest.mock('../../common/hooks/useSelfServiceStoreIntegration', () => ({
    __esModule: true,
    default: jest.fn(),
}))

describe('<AIAgentWelcomePageDynamic />', () => {
    const setupMocks = ({
        storeIntegrationId = 1,
        helpCenters = [],
        helpCentersArticleCount = [],
        isHelpCentersLoading = false,
        isHas20ArticlesLoading = false,
        hasEmailToStoreConnection = false,
        isHasEmailToStoreConnectionLoading = false,
    }: {
        storeIntegrationId?: number
        helpCenters?: Array<{id: number; shop_name: string}>
        helpCentersArticleCount?: Array<{helpCenterId: number; count: number}>
        isEmailConnectionLoading?: boolean
        isHelpCentersLoading?: boolean
        isHas20ArticlesLoading?: boolean

        hasEmailToStoreConnection?: boolean
        isHasEmailToStoreConnectionLoading?: boolean
    } = {}) => {
        ;(useSelfServiceStoreIntegration as jest.Mock).mockReturnValue({
            id: storeIntegrationId,
        })
        ;(useHelpCenterList as jest.Mock).mockReturnValue({
            isLoading: isHelpCentersLoading,
            helpCenters: helpCenters,
        })
        ;(useHelpCentersArticleCount as jest.Mock).mockReturnValue(
            isHas20ArticlesLoading ? undefined : helpCentersArticleCount
        )
        ;(useHasEmailToStoreConnection as jest.Mock).mockReturnValue({
            isLoading: isHasEmailToStoreConnectionLoading,
            hasEmailToStoreConnection,
        })
    }

    const baseLoadingProps = {
        state: 'loading',
        shopType: 'shopify',
        shopName: 'my-shop',
    }

    const baseDynamicProps = {
        state: 'dynamic',
        shopType: 'shopify',
        shopName: 'my-shop',
        emailConnected: {
            checked: false,
            link: '/app/settings/channels/email',
        },
        helpCenterCreated: {
            checked: false,
            link: '/app/settings/help-center/new',
        },
        helpCenter20Articles: {
            checked: false,
            link: '/app/settings/help-center/new',
        },
    }

    const renderAndAssert = (
        props: any = baseDynamicProps,
        shopName: string = 'my-shop'
    ) => {
        render(
            <AIAgentWelcomePageDynamic
                state="dynamic"
                shopType="shopify"
                shopName={shopName}
            />
        )

        expect(
            screen.getByText('ai-agent-welcome-page-view-component-mock')
        ).toBeInTheDocument()

        expect(AIAgentWelcomePageView).toHaveBeenCalledWith(props, {})
        expect(AIAgentWelcomePageView).toHaveBeenCalledTimes(1)
    }

    it('should render the welcome page view with all unchecked props when none of the conditions are met', () => {
        setupMocks()
        renderAndAssert()
        expect(useHasEmailToStoreConnection).toBeCalledWith(1)
    })

    it('should render the welcome page view with the correct props when e-mail is connected', () => {
        setupMocks({
            storeIntegrationId: 6,
            hasEmailToStoreConnection: true,
        })

        renderAndAssert({...baseDynamicProps, emailConnected: {checked: true}})

        expect(useHasEmailToStoreConnection).toBeCalledWith(6)
    })

    it('should render the welcome page view with the correct props when e-mail and help center are connected', () => {
        setupMocks({
            hasEmailToStoreConnection: true,
            helpCenters: [
                {id: 3, shop_name: 'my-test-store'},
                {id: 4, shop_name: 'my-other-store'},
            ],
            helpCentersArticleCount: [{helpCenterId: 3, count: 5}],
        })

        renderAndAssert(
            {
                ...baseDynamicProps,
                shopName: 'my-test-store',
                emailConnected: {checked: true},
                helpCenterCreated: {checked: true},
                helpCenter20Articles: {
                    checked: false,
                    link: '/app/settings/help-center/3/ai-library',
                },
            },
            'my-test-store'
        )
    })

    it('should render the welcome page view with the correct props when multiple help centers are connected', () => {
        setupMocks({
            hasEmailToStoreConnection: true,
            helpCenters: [
                {id: 3, shop_name: 'my-test-store'},
                {id: 4, shop_name: 'my-other-store'},
                {id: 5, shop_name: 'my-test-store'},
            ],
            helpCentersArticleCount: [
                {helpCenterId: 3, count: 5},
                {helpCenterId: 5, count: 2},
            ],
        })

        renderAndAssert(
            {
                ...baseDynamicProps,
                shopName: 'my-test-store',
                emailConnected: {checked: true},
                helpCenterCreated: {checked: true},
                helpCenter20Articles: {
                    checked: false,
                    link: '/app/settings/help-center',
                },
            },
            'my-test-store'
        )
    })

    it('should render the welcome page view with the correct props when e-mail is connected and help center is from another store', () => {
        setupMocks({
            hasEmailToStoreConnection: true,
            helpCenters: [
                {id: 3, shop_name: 'my-test-store'},
                {id: 4, shop_name: 'my-other-store'},
            ],
        })

        renderAndAssert({
            ...baseDynamicProps,
            emailConnected: {checked: true},
        })
    })

    it('should render the welcome page view with the correct props when all conditions are met', () => {
        setupMocks({
            hasEmailToStoreConnection: true,
            helpCenters: [
                {id: 3, shop_name: 'my-test-store'},
                {id: 4, shop_name: 'my-other-store'},
            ],
            helpCentersArticleCount: [{helpCenterId: 3, count: 25}],
        })

        renderAndAssert(
            {
                ...baseDynamicProps,
                shopName: 'my-test-store',
                emailConnected: {checked: true},
                helpCenterCreated: {checked: true},
                helpCenter20Articles: {checked: true},
            },
            'my-test-store'
        )
    })

    it('should render the welcome page view in loading state if the email to store connection is still loading', () => {
        setupMocks({isHasEmailToStoreConnectionLoading: true})
        renderAndAssert(baseLoadingProps)
    })

    it('should render the welcome page view in loading state if the help centers are still loading', () => {
        setupMocks({isHelpCentersLoading: true})
        renderAndAssert(
            {...baseLoadingProps, shopName: 'my-second-test-store'},
            'my-second-test-store'
        )
    })

    it('should render the welcome page view in loading state while checking if any help center has 20+ articles', () => {
        setupMocks({
            hasEmailToStoreConnection: true,
            helpCenters: [{id: 8, shop_name: 'my-shop'}],
            isHas20ArticlesLoading: true,
        })

        renderAndAssert(baseLoadingProps)
    })
})
