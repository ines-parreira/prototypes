import { useCustomAgentUnavailableStatusesFlag } from '@repo/agent-status'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { SidebarContext } from '@repo/navigation'
import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetAccountHandler,
    mockGetCurrentUserHandler,
} from '@gorgias/helpdesk-mocks'

import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { SettingsSidebar } from '../SettingsSidebar'

jest.mock('@repo/agent-status', () => ({
    ...jest.requireActual('@repo/agent-status'),
    useCustomAgentUnavailableStatusesFlag: jest.fn(),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
    useHelpdeskV2WayfindingMS1Flag: jest.fn().mockReturnValue(false),
}))

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))

jest.mock('common/navigation', () => ({
    ...jest.requireActual('common/navigation'),
    Navbar: jest.fn(({ children }) => <div>{children}</div>),
}))

const mockUseCustomAgentUnavailableStatusesFlag = assumeMock(
    useCustomAgentUnavailableStatusesFlag,
)

const mockUseFlag = assumeMock(useFlag)

const mockCurrentUser = mockGetCurrentUserHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        role: { name: 'admin' },
        has_password: false,
    }),
)

const mockAccount = mockGetAccountHandler()

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
        return renderWithStoreAndQueryClientAndRouter(
            <SidebarContext.Provider
                value={{ isCollapsed, toggleCollapse: jest.fn() }}
            >
                <SettingsSidebar />
            </SidebarContext.Provider>,
            state,
        )
    }

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(mockCurrentUser.handler, mockAccount.handler)
        mockUseCustomAgentUnavailableStatusesFlag.mockReturnValue(false)
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
        expect(screen.getByText('Billing & usage')).toBeInTheDocument()
        expect(screen.getByText('HTTP integration')).toBeInTheDocument()
        expect(screen.getByText('REST API')).toBeInTheDocument()
        expect(screen.getByText('Audit logs')).toBeInTheDocument()
        expect(screen.getByText('Password & 2FA')).toBeInTheDocument()
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

    it('should render Imports when historical imports flag is enabled', async () => {
        mockUseFlag.mockImplementation((key) => {
            if (key === FeatureFlagKey.HistoricalImports) {
                return true
            }
            return false
        })

        renderSettingsSidebar()
        expect(await screen.findByText('Imports')).toBeInTheDocument()
        expect(screen.queryByText('Email Import')).not.toBeInTheDocument()
        expect(screen.queryByText('Zendesk import')).not.toBeInTheDocument()
    })

    it('should render Email Import and Zendesk import when historical imports flag is disabled', async () => {
        mockUseFlag.mockReturnValue(false)

        renderSettingsSidebar()
        expect(await screen.findByText('Email Import')).toBeInTheDocument()
        expect(screen.getByText('Zendesk import')).toBeInTheDocument()
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
