import type React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
} from 'models/integration/types/gorgiasChat'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { GorgiasChatCreationWizard } from './GorgiasChatCreationWizard'

const mockUseAiAgentAccess = jest.fn()

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: () => mockUseAiAgentAccess(),
}))

jest.mock('pages/common/hooks/useIsIntersectingWithBrowserViewport', () => ({
    useIsIntersectingWithBrowserViewport: () => false,
}))
jest.mock('pages/common/hooks/useCollapsibleColumn')

const mockWizardSteps = jest.fn()

jest.mock('pages/common/components/wizard/Wizard', () => ({
    __esModule: true,
    Wizard: ({
        children,
        steps,
    }: {
        children: React.ReactNode
        steps: string[]
    }) => {
        mockWizardSteps(steps)
        return <div data-testid="wizard">{children}</div>
    },
}))

jest.mock('pages/common/components/wizard/WizardStep', () => ({
    __esModule: true,
    WizardStep: ({
        children,
        name,
    }: {
        children: React.ReactNode
        name: string
    }) => <div data-testid={`wizard-step-${name}`}>{children}</div>,
}))

jest.mock('./steps/Basics/GorgiasChatCreationWizardStepBasics', () => ({
    __esModule: true,
    GorgiasChatCreationWizardStepBasics: () => <div>Basics Step</div>,
}))

jest.mock('./steps/Brand/GorgiasChatCreationWizardStepBranding', () => ({
    __esModule: true,
    GorgiasChatCreationWizardStepBranding: () => <div>Branding Step</div>,
}))

jest.mock('./steps/Automate/GorgiasChatCreationWizardStepAutomate', () => ({
    __esModule: true,
    GorgiasChatCreationWizardStepAutomate: () => <div>Automate Step</div>,
}))

jest.mock(
    './steps/Installation/GorgiasChatCreationWizardStepInstallation',
    () => ({
        __esModule: true,
        GorgiasChatCreationWizardStepInstallation: () => (
            <div>Installation Step</div>
        ),
    }),
)

const mockStore = configureMockStore([thunk])

beforeEach(() => {
    jest.clearAllMocks()
    mockUseAiAgentAccess.mockReturnValue({
        hasAccess: true,
        isLoading: false,
    })
    ;(useCollapsibleColumn as jest.Mock).mockReturnValue({
        warpToCollapsibleColumn: jest.fn().mockReturnValue(null),
        setIsCollapsibleColumnOpen: jest.fn(),
    })
})

const mockStoreState = {
    currentUser: fromJS({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: { name: 'admin' },
    }),
    integrations: fromJS({
        integrations: [],
    }),
}

const createIntegration = (overrides: Record<string, any> = {}) =>
    fromJS({
        id: 'integration-id',
        name: 'Test Chat',
        meta: { wizard: { status: null } },
        ...overrides,
    })

const emptyLoadingState = fromJS({})

const renderComponent = (
    props: Partial<React.ComponentProps<typeof GorgiasChatCreationWizard>> = {},
    route = '/',
) => {
    const defaultProps = {
        integration: createIntegration(),
        loading: emptyLoadingState,
        isUpdate: false,
    }

    const history = createMemoryHistory({ initialEntries: [route] })

    const result = render(
        <Router history={history}>
            <Provider store={mockStore(mockStoreState)}>
                <GorgiasChatCreationWizard {...defaultProps} {...props} />
            </Provider>
        </Router>,
    )

    return { ...result, history }
}

describe('GorgiasChatCreationWizard (revamp minimal)', () => {
    it('renders create flow breadcrumb', () => {
        const { getByText } = renderComponent()

        expect(getByText('New Chat')).toBeInTheDocument()
        expect(getByText('Chat').closest('a')).toHaveAttribute(
            'href',
            '/app/settings/channels/gorgias_chat',
        )
    })

    it('renders update flow breadcrumb with integration name', () => {
        const integration = createIntegration({ name: 'Updated Chat' })

        const { getByText, queryByText } = renderComponent({
            integration,
            isUpdate: true,
        })

        expect(getByText('Updated Chat')).toBeInTheDocument()
        expect(queryByText('New Chat')).toBeNull()
    })

    it('redirects to chat settings when wizard is published', () => {
        const integration = createIntegration({
            meta: {
                wizard: { status: GorgiasChatCreationWizardStatus.Published },
            },
        })

        const { history } = renderComponent(
            { integration },
            '/app/settings/channels/gorgias_chat/new',
        )

        expect(history.location.pathname).toBe(
            '/app/settings/channels/gorgias_chat',
        )
    })

    describe('wizard steps based on AI agent access', () => {
        it('should include all steps including Automate when user has AI agent access', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            renderComponent()

            expect(mockWizardSteps).toHaveBeenCalledWith([
                GorgiasChatCreationWizardSteps.Basics,
                GorgiasChatCreationWizardSteps.Branding,
                GorgiasChatCreationWizardSteps.Automate,
                GorgiasChatCreationWizardSteps.Installation,
            ])
        })

        it('should not render Automate step component when user does not have AI agent access', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            renderComponent()

            expect(screen.queryByText('Automate Step')).not.toBeInTheDocument()
        })

        it('should not render wizard while AI agent access is loading', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: true,
            })

            renderComponent()

            expect(screen.queryByTestId('wizard')).not.toBeInTheDocument()
        })

        it('should render wizard when AI agent access loading completes', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            renderComponent()

            expect(screen.getByTestId('wizard')).toBeInTheDocument()
        })
    })
})
