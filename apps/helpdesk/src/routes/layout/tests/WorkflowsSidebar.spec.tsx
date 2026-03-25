import { SidebarContext } from '@repo/navigation'
import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler } from '@gorgias/helpdesk-mocks'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'
import { WorkflowsSidebar } from 'routes/layout/sidebars'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset',
    () => ({
        useIsArticleRecommendationsEnabledWhileSunset: jest.fn(),
    }),
)

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))

jest.mock('common/navigation', () => ({
    ...jest.requireActual('common/navigation'),
    Navbar: jest.fn(({ children }) => <div>{children}</div>),
}))

const mockUseAiAgentAccess = assumeMock(useAiAgentAccess)
const mockUseStoreIntegrations = assumeMock(useStoreIntegrations)
const mockUseIsArticleRecommendationsEnabledWhileSunset = assumeMock(
    useIsArticleRecommendationsEnabledWhileSunset,
)

const mockCurrentUser = mockGetCurrentUserHandler(async ({ data }) =>
    HttpResponse.json({ ...data, role: { name: 'admin' } }),
)

const server = setupServer()

describe('WorkflowsSidebar', () => {
    const defaultState = {
        currentUser: fromJS({
            has_password: true,
            role: { name: 'admin' },
        }),
        currentAccount: fromJS({
            domain: 'test-domain',
        }),
    }

    const renderWorkflowsSidebar = (
        state = defaultState,
        isCollapsed = false,
    ) => {
        return renderWithStoreAndQueryClientAndRouter(
            <SidebarContext.Provider
                value={{ isCollapsed, toggleCollapse: jest.fn() }}
            >
                <WorkflowsSidebar />
            </SidebarContext.Provider>,
            state,
        )
    }

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(mockCurrentUser.handler)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        mockUseStoreIntegrations.mockReturnValue([
            { id: 1, type: 'shopify', name: 'test-store' } as any,
        ])
        mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInSettings: false,
        } as any)
    })

    afterEach(() => {
        server.resetHandlers()
        jest.clearAllMocks()
    })

    afterAll(() => {
        server.close()
    })

    it('should render Tools section with workflow items', async () => {
        renderWorkflowsSidebar()
        expect(await screen.findByText('Flows')).toBeInTheDocument()
        expect(screen.getByText('Order management')).toBeInTheDocument()
        expect(screen.getByText('Rules')).toBeInTheDocument()
        expect(screen.getByText('Macros')).toBeInTheDocument()
        expect(screen.getByText('Ticket assignment')).toBeInTheDocument()
        expect(screen.getByText('Auto-merge')).toBeInTheDocument()
        expect(screen.getByText('CSAT')).toBeInTheDocument()
        expect(screen.getByText('SLAs')).toBeInTheDocument()
    })

    it('should render Fields and Tags section', async () => {
        renderWorkflowsSidebar()
        expect(await screen.findByText('Ticket fields')).toBeInTheDocument()
        expect(screen.getByText('Customer fields')).toBeInTheDocument()
        expect(screen.getByText('Field conditions')).toBeInTheDocument()
        expect(screen.getByText('Tags')).toBeInTheDocument()
    })

    it('should render AI Agent related items when hasAccess is true and integrations exist', async () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        mockUseStoreIntegrations.mockReturnValue([
            { id: 1, type: 'shopify', name: 'test-store' } as any,
        ])

        renderWorkflowsSidebar()

        expect(await screen.findByText('Flows')).toBeInTheDocument()
        expect(screen.getByText('Order management')).toBeInTheDocument()
    })

    it('should not render AI Agent related items when hasAccess is false', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        mockUseStoreIntegrations.mockReturnValue([
            { id: 1, type: 'shopify', name: 'test-store' } as any,
        ])

        renderWorkflowsSidebar()

        expect(screen.queryByText('Flows')).not.toBeInTheDocument()
        expect(screen.queryByText('Order management')).not.toBeInTheDocument()
    })

    it('should not render AI Agent related items when no integrations exist', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        mockUseStoreIntegrations.mockReturnValue([])

        renderWorkflowsSidebar()

        expect(screen.queryByText('Flows')).not.toBeInTheDocument()
        expect(screen.queryByText('Order management')).not.toBeInTheDocument()
    })

    it('should not render AI Agent related items when isLoading is true', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: true,
        })
        mockUseStoreIntegrations.mockReturnValue([
            { id: 1, type: 'shopify', name: 'test-store' } as any,
        ])

        renderWorkflowsSidebar()

        expect(screen.queryByText('Flows')).not.toBeInTheDocument()
        expect(screen.queryByText('Order management')).not.toBeInTheDocument()
    })

    it('should render Article Recommendations when enabled in settings and AI agent access is available', async () => {
        mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInSettings: true,
        } as any)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        mockUseStoreIntegrations.mockReturnValue([
            { id: 1, type: 'shopify', name: 'test-store' } as any,
        ])

        renderWorkflowsSidebar()

        expect(
            await screen.findByText('Article recommendations'),
        ).toBeInTheDocument()
    })

    it('should not render Article Recommendations when not enabled in settings', () => {
        mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInSettings: false,
        } as any)

        renderWorkflowsSidebar()

        expect(
            screen.queryByText('Article recommendations'),
        ).not.toBeInTheDocument()
    })

    it('should not render Article Recommendations when AI agent access is not available', () => {
        mockUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInSettings: true,
        } as any)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        renderWorkflowsSidebar()

        expect(
            screen.queryByText('Article recommendations'),
        ).not.toBeInTheDocument()
    })

    describe('collapsed state', () => {
        it('should render CollapsedWorkflowsSidebar when collapsed', () => {
            renderWorkflowsSidebar(defaultState, true)
            expect(screen.queryByText('Flows')).not.toBeInTheDocument()
            expect(screen.queryByText('Rules')).not.toBeInTheDocument()
        })
    })
})
