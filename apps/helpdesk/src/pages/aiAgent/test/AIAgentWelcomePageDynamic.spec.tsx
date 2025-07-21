import { render, screen } from '@testing-library/react'

import { useHasEmailToStoreConnection } from 'pages/automate/common/components/TopQuestions/useHasEmailToStoreConnection'
import { useHelpCentersArticleCount } from 'pages/automate/common/hooks/useHelpCentersArticleCount'
import useSelfServiceStoreIntegration from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import { useHelpCenterList } from 'pages/settings/helpCenter/hooks/useHelpCenterList'

import { AIAgentWelcomePageDynamic } from '../AIAgentWelcomePageDynamic'
import { AIAgentWelcomePageView } from '../components/AIAgentWelcomePageView/AIAgentWelcomePageView'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterList', () => ({
    useHelpCenterList: jest.fn(),
}))

jest.mock('pages/automate/common/hooks/useHelpCentersArticleCount')

jest.mock(
    '../components/AIAgentWelcomePageView/AIAgentWelcomePageView',
    () => ({
        AIAgentWelcomePageView: jest.fn(() => (
            <div>ai-agent-welcome-page-view-component-mock</div>
        )),
    }),
)

jest.mock(
    'pages/automate/common/components/TopQuestions/useHasEmailToStoreConnection',
)

jest.mock('pages/automate/common/hooks/useSelfServiceStoreIntegration', () => ({
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
        helpCenters?: Array<{ id: number; shop_name: string }>
        helpCentersArticleCount?: Array<{ helpCenterId: number; count: number }>
        isEmailConnectionLoading?: boolean
        isHelpCentersLoading?: boolean
        isHas20ArticlesLoading?: boolean

        hasEmailToStoreConnection?: boolean
        isHasEmailToStoreConnectionLoading?: boolean
        isShopifyPermissionUpdated?: boolean
    } = {}) => {
        ;(useSelfServiceStoreIntegration as jest.Mock).mockReturnValue({
            id: storeIntegrationId,
        })
        ;(useHelpCenterList as jest.Mock).mockReturnValue({
            isLoading: isHelpCentersLoading,
            helpCenters: helpCenters,
        })
        ;(useHelpCentersArticleCount as jest.Mock).mockReturnValue(
            isHas20ArticlesLoading ? undefined : helpCentersArticleCount,
        )
        ;(useHasEmailToStoreConnection as jest.Mock).mockReturnValue({
            isLoading: isHasEmailToStoreConnectionLoading,
            hasEmailToStoreConnection,
        })
    }

    const baseProps = {
        accountDomain: 'my-account-domain',
        shopType: 'shopify',
        shopName: 'my-shop',
    }

    const renderAndAssert = (
        props: any = baseProps,
        shopName: string = 'my-shop',
    ) => {
        render(
            <AIAgentWelcomePageDynamic
                accountDomain="my-account-domain"
                shopType="shopify"
                shopName={shopName}
            />,
        )

        expect(
            screen.getByText('ai-agent-welcome-page-view-component-mock'),
        ).toBeInTheDocument()

        expect(AIAgentWelcomePageView).toHaveBeenCalledWith(props, {})
        expect(AIAgentWelcomePageView).toHaveBeenCalledTimes(1)
    }

    it('should render the welcome page view in loading state if the email to store connection is still loading', () => {
        setupMocks({ isHasEmailToStoreConnectionLoading: true })
        renderAndAssert(baseProps)
    })

    it('should render the welcome page view in loading state if the help centers are still loading', () => {
        setupMocks({ isHelpCentersLoading: true })
        renderAndAssert(
            { ...baseProps, shopName: 'my-second-test-store' },
            'my-second-test-store',
        )
    })

    it('should render the welcome page view in loading state while checking if any help center has 20+ articles', () => {
        setupMocks({
            hasEmailToStoreConnection: true,
            helpCenters: [{ id: 8, shop_name: 'my-shop' }],
            isHas20ArticlesLoading: true,
        })

        renderAndAssert(baseProps)
    })

    it('should render the welcome page view for onboardind wizard', () => {
        setupMocks({
            hasEmailToStoreConnection: true,
            helpCenters: [{ id: 8, shop_name: 'my-shop' }],
            isHas20ArticlesLoading: true,
        })

        renderAndAssert(baseProps)

        expect(
            screen.getByText('ai-agent-welcome-page-view-component-mock'),
        ).toBeInTheDocument()
    })
})
