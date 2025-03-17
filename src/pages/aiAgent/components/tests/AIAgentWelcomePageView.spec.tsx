import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { mockFlags } from 'jest-launchdarkly-mock'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'
import { notify } from 'state/notifications/actions'
import { renderWithRouter } from 'utils/testing'

import { WIZARD_UPDATE_QUERY_KEY } from '../../constants'
import { getStoreConfigurationFixture } from '../../fixtures/storeConfiguration.fixtures'
import { useWelcomePageAcknowledgedMutation } from '../../hooks/useWelcomePageAcknowledgedMutation'
import { AIAgentWelcomePageView } from '../AIAgentWelcomePageView/AIAgentWelcomePageView'

const MOCK_WIZARD_VALUES = {
    wizard: {
        id: 1,
        stepName: AiAgentOnboardingWizardStep.Personalize,
        completedDatetime: null,
        stepData: {
            enabledChannels: [],
            isAutoresponderTurnedOff: null,
            onCompletePathway: null,
        },
    },
}

jest.mock('@gorgias/merchant-ui-kit', () => ({
    __esModule: true,
    Skeleton: () => <div>loading-skeleton</div>,
}))

jest.mock('../../hooks/useWelcomePageAcknowledgedMutation', () => ({
    useWelcomePageAcknowledgedMutation: jest.fn(() => ({
        isLoading: false,
        useWelcomePageAcknowledgedMutation: jest.fn(),
    })),
}))

jest.mock('../../hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: jest.fn(() => ({
        isAdmin: true,
        isLoading: false,
        onboardingNotificationState: undefined,
        handleOnSave: jest.fn(),
        handleOnSendOrCancelNotification: jest.fn(),
        handleOnEnablementPostReceivedNotification: jest.fn(),
        handleOnPerformActionPostReceivedNotification: jest.fn(),
        isAiAgentOnboardingNotificationEnabled: true,
    })),
}))

jest.mock('hooks/useAppDispatch')

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        AiAgentWelcomePageViewed: 'ai-agent-welcome-page-viewed',
        AiAgentWelcomePageCtaClicked: 'ai-agent-welcome-page-cta-clicked',
    },
}))

mockFlags({
    [FeatureFlagKey.AiAgentOnboardingWizard]: false,
})

describe('<AIAgentWelcomePageView />', () => {
    const assertText = (text: string, occurences = 1) => {
        expect(screen.queryAllByText(text)).toHaveLength(occurences)
    }

    const assertHref = (href: string, occurences = 1) => {
        const links = screen.queryAllByRole('link')
        expect(
            links.filter((link) => link.getAttribute('href') === href),
        ).toHaveLength(occurences)
    }

    const assertButtonAndLearnMore = () => {
        expect(
            screen.getByText('Set Up AI Agent', {
                selector: 'button span',
            }),
        ).toBeInTheDocument()

        const item1 = screen.getByText(
            'Join our AI Agent Masterclass live webinar',
        )
        expect(item1).toContainElement(screen.getByText('ondemand_video'))
        expect(item1).toHaveAttribute(
            'href',
            'https://link.gorgias.com/ai-agent-webinar-product',
        )

        const item2 = screen.getByText('How to set up AI Agent')
        expect(item2).toContainElement(screen.getByText('chrome_reader_mode'))
        expect(item2).toHaveAttribute(
            'href',
            'https://link.gorgias.com/ai-agent-help-product',
        )
    }

    it('should render loading state correctly', async () => {
        render(
            <AIAgentWelcomePageView
                accountDomain="my-account-domain"
                shopType="shopify"
                shopName="my-store"
                state="loading"
            />,
        )
        expect(await screen.findAllByText('loading-skeleton')).toHaveLength(5)
        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should render static state correctly', () => {
        render(
            <AIAgentWelcomePageView
                accountDomain="my-account-domain"
                shopType="shopify"
                shopName="my-store"
                state="static"
            />,
        )

        expect(
            screen.getByText(
                'Introducing AI Agent, your team’s newest member for seamless customer interactions who can:',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Consume all your brand’s knowledge, identity and tone',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Follow Guidance built by you'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Enhance team productivity, reducing workload & response times',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Guide customers towards swift resolutions in seconds, not hours',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Continuously improve based on your reviews & feedback',
            ),
        ).toBeInTheDocument()

        assertButtonAndLearnMore()

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentWelcomePageViewed,
            { version: 'Basic', store: 'my-store' },
        )
    })

    it('should call createWelcomePageAcknowledged with correct parameters on button click in static state', async () => {
        const createWelcomePageAcknowledgedMock = jest.fn()
        ;(useWelcomePageAcknowledgedMutation as jest.Mock).mockReturnValue({
            createWelcomePageAcknowledged: createWelcomePageAcknowledgedMock,
            isLoading: false,
        })

        render(
            <AIAgentWelcomePageView
                state="static"
                accountDomain="my-account-domain"
                shopType="shopify"
                shopName="my-shop"
            />,
        )

        const button = screen.getByRole('button', {
            name: /Set Up AI Agent/i,
        })

        fireEvent.click(button)

        expect(createWelcomePageAcknowledgedMock).toHaveBeenCalledWith([
            'my-account-domain',
            'my-shop',
        ])

        await waitFor(() =>
            expect(logEvent).toHaveBeenLastCalledWith(
                SegmentEvent.AiAgentWelcomePageCtaClicked,
                { version: 'Basic', store: 'my-shop' },
            ),
        )
    })

    it('should render dynamic state correctly when nothing is checked', () => {
        render(
            <AIAgentWelcomePageView
                accountDomain="my-account-domain"
                shopType="shopify"
                shopName="my-store"
                state="dynamic"
                emailConnected={{
                    checked: false,
                    link: 'welcome-page-connect-email-link',
                }}
                helpCenterCreated={{
                    checked: false,
                    link: 'welcome-page-create-help-center-link',
                }}
                helpCenter20Articles={{
                    checked: false,
                    link: 'welcome-page-add-articles-link',
                }}
            />,
        )

        assertText(
            'Prepare AI Agent to automate 60% of your email and contact form tickets by completing these steps',
        )
        assertText('Connect an email to this store')
        assertText('Create or import a Help Center')
        assertText('Add 20+ articles to your Help Center')

        assertHref('welcome-page-connect-email-link')
        assertHref('welcome-page-create-help-center-link')
        assertHref('welcome-page-add-articles-link')

        assertText('1')
        assertText('2')
        assertText('3')

        assertText('checked', 0)

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentWelcomePageViewed,
            { version: 'Dynamic', store: 'my-store' },
        )

        assertButtonAndLearnMore()
    })

    it('should render dynamic state correctly when some are checked', () => {
        render(
            <AIAgentWelcomePageView
                accountDomain="my-account-domain"
                shopType="shopify"
                shopName="my-store"
                state="dynamic"
                emailConnected={{
                    checked: false,
                    link: 'welcome-page-connect-email-link',
                }}
                helpCenterCreated={{
                    checked: true,
                }}
                helpCenter20Articles={{
                    checked: true,
                }}
            />,
        )

        assertText(
            'Prepare AI Agent to automate 60% of your email and contact form tickets by completing these steps',
        )
        assertText('Connect an email to this store')
        assertText('Create or import a Help Center')
        assertText('Add 20+ articles to your Help Center')

        assertHref('welcome-page-connect-email-link')
        assertHref('welcome-page-create-help-center-link', 0)
        assertHref('welcome-page-add-articles-link', 0)

        assertText('1')
        assertText('2', 0)
        assertText('3', 0)

        assertText('checked', 2)
    })

    it('should render dynamic state correctly when all are checked', () => {
        render(
            <AIAgentWelcomePageView
                accountDomain="my-account-domain"
                shopType="shopify"
                shopName="my-store"
                state="dynamic"
                emailConnected={{
                    checked: true,
                }}
                helpCenterCreated={{
                    checked: true,
                }}
                helpCenter20Articles={{
                    checked: true,
                }}
            />,
        )

        assertText(
            'Prepare AI Agent to automate 60% of your email and contact form tickets by completing these steps',
        )
        assertText('Connect an email to this store')
        assertText('Create or import a Help Center')
        assertText('Add 20+ articles to your Help Center')

        assertHref('welcome-page-connect-email-link', 0)
        assertHref('welcome-page-create-help-center-link', 0)
        assertHref('welcome-page-add-articles-link', 0)

        assertText('1', 0)
        assertText('2', 0)
        assertText('3', 0)

        assertText('checked', 3)
    })

    it('should call createWelcomePageAcknowledged with correct parameters on button click in dynamic state', async () => {
        const createWelcomePageAcknowledgedMock = jest.fn()
        ;(useWelcomePageAcknowledgedMutation as jest.Mock).mockReturnValue({
            createWelcomePageAcknowledged: createWelcomePageAcknowledgedMock,
            isLoading: false,
        })

        render(
            <AIAgentWelcomePageView
                accountDomain="my-account-domain"
                shopType="shopify"
                shopName="my-store"
                state="dynamic"
                emailConnected={{
                    checked: true,
                }}
                helpCenterCreated={{
                    checked: true,
                }}
                helpCenter20Articles={{
                    checked: true,
                }}
            />,
        )

        const button = screen.getByRole('button', {
            name: /Set Up AI Agent/i,
        })

        fireEvent.click(button)

        expect(createWelcomePageAcknowledgedMock).toHaveBeenCalledWith([
            'my-account-domain',
            'my-store',
        ])

        await waitFor(() =>
            expect(logEvent).toHaveBeenLastCalledWith(
                SegmentEvent.AiAgentWelcomePageCtaClicked,
                { version: 'Dynamic', store: 'my-store' },
            ),
        )
    })

    it('should disable button when loading', () => {
        const createWelcomePageAcknowledgedMock = jest.fn()
        ;(useWelcomePageAcknowledgedMutation as jest.Mock).mockReturnValue({
            createWelcomePageAcknowledged: createWelcomePageAcknowledgedMock,
            isLoading: true,
        })

        render(
            <AIAgentWelcomePageView
                state="static"
                accountDomain="my-account-domain"
                shopType="shopify"
                shopName="my-shop"
            />,
        )

        const button = screen.getByRole<HTMLButtonElement>('button', {
            name: /Set Up AI Agent/i,
        })

        fireEvent.click(button)

        expect(createWelcomePageAcknowledgedMock).not.toHaveBeenCalled()
        expect(button).toBeAriaDisabled()
    })

    it('should call dispatch with correct parameters on mutation failure', async () => {
        const createWelcomePageAcknowledgedMock = jest
            .fn()
            .mockRejectedValueOnce(new Error('Test Error'))
            .mockRejectedValueOnce('Some other error')

        ;(useWelcomePageAcknowledgedMutation as jest.Mock).mockReturnValue({
            createWelcomePageAcknowledged: createWelcomePageAcknowledgedMock,
            isLoading: false,
        })

        const dispatchMock = jest.fn()
        ;(useAppDispatch as jest.Mock).mockReturnValue(dispatchMock)

        const notifyMock = jest.fn(() => 'notify-return')
        ;(notify as jest.Mock).mockImplementation(notifyMock)

        render(
            <AIAgentWelcomePageView
                state="static"
                accountDomain="my-account-domain"
                shopType="shopify"
                shopName="my-shop"
            />,
        )

        const button = screen.getByRole('button', {
            name: /Set Up AI Agent/i,
        })

        fireEvent.click(button)

        await waitFor(() =>
            expect(dispatchMock).toHaveBeenLastCalledWith('notify-return'),
        )

        await waitFor(() =>
            expect(notifyMock).toHaveBeenLastCalledWith({
                message: 'Test Error',
                status: 'error',
            }),
        )

        fireEvent.click(button)

        await waitFor(() =>
            expect(dispatchMock).toHaveBeenLastCalledWith('notify-return'),
        )

        await waitFor(() =>
            expect(notifyMock).toHaveBeenLastCalledWith({
                message: 'An unknown error occurred',
                status: 'error',
            }),
        )
    })
    it('should render onboardingWizard state with the correct copy', () => {
        render(
            <AIAgentWelcomePageView
                accountDomain="my-account-domain"
                shopType="shopify"
                shopName="my-store"
                state="onboardingWizard"
                emailConnected={{
                    checked: true,
                }}
                helpCenterCreated={{
                    checked: true,
                }}
                helpCenter20Articles={{
                    checked: true,
                }}
                shopifyPermissionUpdated={{
                    checked: true,
                }}
            />,
        )

        assertText(
            'Prepare AI Agent to automate 60% of your email, Chat and Contact Form tickets by completing these steps:',
        )
        assertText('Update your Shopify integration')
        assertText('Connect an email to this store')
        assertText('Create or import a Help Center')
        assertText('Add 20+ articles to your Help Center')
    })

    it('should redirect to AiAgentOnboardingWizard page when Set up AI Agent button is clicked', () => {
        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        const SHOP_NAME = 'my-store'
        const SHOP_TYPE = 'shopify'

        renderWithRouter(
            <AIAgentWelcomePageView
                accountDomain="my-account-domain"
                shopType={SHOP_TYPE}
                shopName={SHOP_NAME}
                state="onboardingWizard"
                emailConnected={{
                    checked: true,
                }}
                helpCenterCreated={{
                    checked: true,
                }}
                helpCenter20Articles={{
                    checked: true,
                }}
                shopifyPermissionUpdated={{
                    checked: true,
                }}
            />,
            { history },
        )

        const button = screen.getByRole('button', {
            name: /Set Up AI Agent/i,
        })

        fireEvent.click(button)

        expect(historyPushSpy).toHaveBeenCalledWith({
            pathname: `/app/automation/${SHOP_TYPE}/${SHOP_NAME}/ai-agent/new`,
            search: '',
        })
    })

    it('should redirect to AiAgentOnboardingWizard page with search params when Continue Set Up button is clicked', () => {
        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        const SHOP_NAME = 'my-store'
        const SHOP_TYPE = 'shopify'

        renderWithRouter(
            <AIAgentWelcomePageView
                accountDomain="my-account-domain"
                shopType={SHOP_TYPE}
                shopName={SHOP_NAME}
                storeConfiguration={getStoreConfigurationFixture(
                    MOCK_WIZARD_VALUES,
                )}
                state="onboardingWizard"
                emailConnected={{
                    checked: true,
                }}
                helpCenterCreated={{
                    checked: true,
                }}
                helpCenter20Articles={{
                    checked: true,
                }}
                shopifyPermissionUpdated={{
                    checked: true,
                }}
            />,
            { history },
        )

        const button = screen.getByRole('button', {
            name: /Continue Setup/i,
        })

        fireEvent.click(button)

        expect(historyPushSpy).toHaveBeenCalledWith({
            pathname: `/app/automation/${SHOP_TYPE}/${SHOP_NAME}/ai-agent/new`,
            search: `?${WIZARD_UPDATE_QUERY_KEY}=true`,
        })
    })

    it('should redirect to the new onboarding page without search params when Continue Set Up button is clicked with ff active', () => {
        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        const SHOP_NAME = 'my-store'
        const SHOP_TYPE = 'shopify'

        mockFlags({
            [FeatureFlagKey.ConvAiStandaloneMenu]: true,
            [FeatureFlagKey.ConvAiOnboarding]: true,
        })

        renderWithRouter(
            <AIAgentWelcomePageView
                accountDomain="my-account-domain"
                shopType={SHOP_TYPE}
                shopName={SHOP_NAME}
                state="onboardingWizard"
                emailConnected={{
                    checked: true,
                }}
                helpCenterCreated={{
                    checked: true,
                }}
                helpCenter20Articles={{
                    checked: true,
                }}
                shopifyPermissionUpdated={{
                    checked: true,
                }}
            />,
            { history },
        )

        const button = screen.getByRole('button', {
            name: /Set Up Ai Agent/i,
        })

        fireEvent.click(button)

        expect(historyPushSpy).toHaveBeenCalledWith({
            pathname: `/app/ai-agent/${SHOP_TYPE}/${SHOP_NAME}/onboarding`,
            search: '',
        })
    })

    it('should render dynamic state for Onboarding Wizard update when storeConfiguration is exist', () => {
        render(
            <AIAgentWelcomePageView
                accountDomain="my-account-domain"
                shopType="shopify"
                shopName="my-store"
                storeConfiguration={getStoreConfigurationFixture(
                    MOCK_WIZARD_VALUES,
                )}
                state="onboardingWizard"
                emailConnected={{
                    checked: true,
                }}
                helpCenterCreated={{
                    checked: true,
                }}
                helpCenter20Articles={{
                    checked: true,
                }}
                shopifyPermissionUpdated={{
                    checked: true,
                }}
            />,
        )

        assertText(
            'Prepare AI Agent to automate 60% of your tickets by completing these steps:',
        )
        assertText('Update your Shopify integration')
        assertText('Connect an email to this store')
        assertText('Create or import a Help Center')
        assertText('Add 20+ articles to your Help Center')

        expect(
            screen.getByRole('button', {
                name: /Continue Setup/i,
            }),
        ).toBeInTheDocument()
    })
})
