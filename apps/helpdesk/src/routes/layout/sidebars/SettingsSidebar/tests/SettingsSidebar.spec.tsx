import type { ReactNode } from 'react'

import { useCustomAgentUnavailableStatusesFlag } from '@repo/agent-status'
import { NavigationProvider } from '@repo/navigation'
import { MockSidebarProvider } from '@repo/navigation/fixtures'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetAccountHandler,
    mockGetCurrentUserHandler,
} from '@gorgias/helpdesk-mocks'

import { createMockStandaloneAiAccess } from 'fixtures/standaloneAiAccess'
import { useStandaloneAiContext } from 'providers/standalone-ai/StandaloneAiContext'

import { SettingsSidebar } from '../SettingsSidebar'

jest.mock('@repo/agent-status', () => ({
    ...jest.requireActual('@repo/agent-status'),
    useCustomAgentUnavailableStatusesFlag: jest.fn(),
}))

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))

jest.mock('providers/standalone-ai/StandaloneAiContext', () => ({
    useStandaloneAiContext: jest.fn(),
}))

jest.mock('common/navigation', () => ({
    ...jest.requireActual('common/navigation'),
    Navbar: jest.fn(({ children }) => <div>{children}</div>),
}))

const mockUseCustomAgentUnavailableStatusesFlag = assumeMock(
    useCustomAgentUnavailableStatusesFlag,
)
const mockUseStandaloneAiContext = assumeMock(useStandaloneAiContext)

const mockCurrentUser = mockGetCurrentUserHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        role: { name: 'admin' },
        has_password: true,
    }),
)

const mockAccount = mockGetAccountHandler()

const TestingNavigationProvider = ({ children }: { children?: ReactNode }) => (
    <NavigationProvider>{children}</NavigationProvider>
)

const server = setupServer()

describe('SettingsSidebar', () => {
    const defaultState = {
        currentUser: fromJS({
            has_password: true,
            role: { name: 'admin' },
        }),
        currentAccount: fromJS({
            domain: 'test-domain',
        }),
    }

    const renderSettingsSidebar = (
        state = defaultState,
        isCollapsed = false,
    ) => {
        return render(
            <MockSidebarProvider isCollapsed={isCollapsed}>
                <SettingsSidebar />
            </MockSidebarProvider>,
            {
                storeState: state,
                wrapper: TestingNavigationProvider,
            },
        )
    }

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(mockCurrentUser.handler, mockAccount.handler)
        mockUseCustomAgentUnavailableStatusesFlag.mockReturnValue(false)
        mockUseStandaloneAiContext.mockReturnValue(
            createMockStandaloneAiAccess({
                statistics: { canRead: true, canWrite: true },
                userManagement: { canRead: true, canWrite: true },
            }),
        )
    })

    afterEach(() => {
        server.resetHandlers()
        jest.clearAllMocks()
    })

    afterAll(() => {
        server.close()
    })

    it('should render Apps section with items', async () => {
        renderSettingsSidebar()
        expect(await screen.findByText('Installed apps')).toBeInTheDocument()
        expect(screen.getByText('App store')).toBeInTheDocument()
    })

    it('should render Workspace section with items', async () => {
        renderSettingsSidebar()
        expect(await screen.findByText('Store')).toBeInTheDocument()
        expect(screen.getByText('Business hours')).toBeInTheDocument()
    })

    it('should render Channels section with items', async () => {
        renderSettingsSidebar()
        expect(await screen.findByText('Phone numbers')).toBeInTheDocument()
        expect(screen.getByText('Help Center')).toBeInTheDocument()
        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('Voice')).toBeInTheDocument()
        expect(screen.getByText('SMS')).toBeInTheDocument()
        expect(screen.getByText('Chat')).toBeInTheDocument()
        expect(screen.getByText('Contact form')).toBeInTheDocument()
    })

    it('should render Account section with items', async () => {
        renderSettingsSidebar()
        expect(await screen.findByText('Users')).toBeInTheDocument()
        expect(screen.getByText('Teams')).toBeInTheDocument()
        expect(screen.getByText('Access management')).toBeInTheDocument()
        expect(screen.getByText('Billing and usage')).toBeInTheDocument()
        expect(screen.getByText('HTTP integration')).toBeInTheDocument()
        expect(screen.getByText('REST API')).toBeInTheDocument()
        expect(screen.getByText('Audit logs')).toBeInTheDocument()
        expect(screen.getByText('Imports')).toBeInTheDocument()
        expect(screen.getByText('Password & 2FA')).toBeInTheDocument()
        expect(screen.getByText('Notifications')).toBeInTheDocument()
    })

    it('should only show Password & 2FA and Notifications in the Account section for non-admin users', async () => {
        const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                role: { name: 'agent' },
                has_password: true,
            }),
        )
        server.use(handler)

        renderSettingsSidebar({
            ...defaultState,
            currentUser: fromJS({
                has_password: true,
                role: { name: 'agent' },
            }),
        })

        expect(await screen.findByText('Password & 2FA')).toBeInTheDocument()
        expect(screen.getByText('Notifications')).toBeInTheDocument()

        expect(screen.queryByText('Users')).not.toBeInTheDocument()
        expect(screen.queryByText('Teams')).not.toBeInTheDocument()
        expect(screen.queryByText('Access management')).not.toBeInTheDocument()
        expect(screen.queryByText('Billing and usage')).not.toBeInTheDocument()
        expect(screen.queryByText('HTTP integration')).not.toBeInTheDocument()
        expect(screen.queryByText('REST API')).not.toBeInTheDocument()
        expect(screen.queryByText('Audit logs')).not.toBeInTheDocument()
        expect(screen.queryByText('Imports')).not.toBeInTheDocument()
    })

    it('should label the Password & 2FA item as "2FA" when the user has no password', async () => {
        const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                role: { name: 'admin' },
                has_password: false,
            }),
        )
        server.use(handler)

        renderSettingsSidebar({
            ...defaultState,
            currentUser: fromJS({
                has_password: false,
                role: { name: 'admin' },
            }),
        })

        expect(await screen.findByText('2FA')).toBeInTheDocument()
        expect(screen.queryByText('Password & 2FA')).not.toBeInTheDocument()
    })

    it('should render Agent unavailability when feature flag is enabled', async () => {
        mockUseCustomAgentUnavailableStatusesFlag.mockReturnValue(true)

        renderSettingsSidebar()
        expect(
            await screen.findByText('Agent unavailability'),
        ).toBeInTheDocument()
    })

    it('should not render Agent unavailability when feature flag is disabled', async () => {
        mockUseCustomAgentUnavailableStatusesFlag.mockReturnValue(false)

        renderSettingsSidebar()
        expect(await screen.findByText('Installed apps')).toBeInTheDocument()
        expect(
            screen.queryByText('Agent unavailability'),
        ).not.toBeInTheDocument()
    })

    it('should render Imports in the account section', async () => {
        renderSettingsSidebar()
        expect(await screen.findByText('Imports')).toBeInTheDocument()
        expect(screen.queryByText('Email Import')).not.toBeInTheDocument()
        expect(screen.queryByText('Zendesk import')).not.toBeInTheDocument()
    })

    it('should hide restricted items for standalone AI accounts', async () => {
        mockUseStandaloneAiContext.mockReturnValue(
            createMockStandaloneAiAccess({
                isStandaloneAiAgent: true,
                statistics: { canRead: true, canWrite: true },
                userManagement: { canRead: true, canWrite: true },
            }),
        )

        renderSettingsSidebar()

        expect(await screen.findByText('Installed apps')).toBeInTheDocument()
        expect(screen.getByText('App store')).toBeInTheDocument()
        expect(screen.getByText('Store')).toBeInTheDocument()
        expect(screen.getByText('Users')).toBeInTheDocument()
        expect(screen.getByText('Access management')).toBeInTheDocument()
        expect(screen.getByText('Billing and usage')).toBeInTheDocument()
        expect(screen.getByText('REST API')).toBeInTheDocument()
        expect(screen.getByText('Audit logs')).toBeInTheDocument()
        expect(screen.getByText('Password & 2FA')).toBeInTheDocument()
        expect(screen.getByText('Notifications')).toBeInTheDocument()
        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('Chat')).toBeInTheDocument()

        expect(screen.queryByText('Business hours')).not.toBeInTheDocument()
        expect(screen.queryByText('Help Center')).not.toBeInTheDocument()
        expect(screen.queryByText('Phone numbers')).not.toBeInTheDocument()
        expect(screen.queryByText('Voice')).not.toBeInTheDocument()
        expect(screen.queryByText('SMS')).not.toBeInTheDocument()
        expect(screen.queryByText('Contact form')).not.toBeInTheDocument()
        expect(screen.queryByText('Teams')).not.toBeInTheDocument()
        expect(screen.queryByText('HTTP integration')).not.toBeInTheDocument()
        expect(screen.queryByText('Imports')).not.toBeInTheDocument()
    })

    describe('collapsed state', () => {
        it('should render CollapsedSettingsSidebar when collapsed', () => {
            renderSettingsSidebar(defaultState, true)
            expect(screen.queryByText('Installed apps')).not.toBeInTheDocument()
            expect(screen.queryByText('Store')).not.toBeInTheDocument()
        })
    })
})
