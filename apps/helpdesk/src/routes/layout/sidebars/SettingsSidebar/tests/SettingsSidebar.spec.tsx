import { useCustomAgentUnavailableStatusesFlag } from '@repo/agent-status'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { SidebarContext } from '@repo/navigation'
import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

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

    beforeEach(() => {
        mockUseCustomAgentUnavailableStatusesFlag.mockReturnValue(false)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render Apps section with items', () => {
        renderSettingsSidebar()
        expect(screen.getByText('Installed apps')).toBeInTheDocument()
        expect(screen.getByText('App store')).toBeInTheDocument()
    })

    it('should render Workspace section with items', () => {
        renderSettingsSidebar()
        expect(screen.getByText('Store')).toBeInTheDocument()
        expect(screen.getByText('Business hours')).toBeInTheDocument()
        expect(screen.getByText('Default views')).toBeInTheDocument()
    })

    it('should render Channels section with items', () => {
        renderSettingsSidebar()
        expect(screen.getByText('Help Center')).toBeInTheDocument()
        expect(screen.getByText('Phone numbers')).toBeInTheDocument()
        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('Voice')).toBeInTheDocument()
        expect(screen.getByText('SMS')).toBeInTheDocument()
        expect(screen.getByText('Chat')).toBeInTheDocument()
        expect(screen.getByText('Contact form')).toBeInTheDocument()
    })

    it('should render Account section with items', () => {
        renderSettingsSidebar()
        expect(screen.getByText('Users')).toBeInTheDocument()
        expect(screen.getByText('Teams')).toBeInTheDocument()
        expect(screen.getByText('Access management')).toBeInTheDocument()
        expect(screen.getByText('Billing & usage')).toBeInTheDocument()
        expect(screen.getByText('HTTP integration')).toBeInTheDocument()
        expect(screen.getByText('REST API')).toBeInTheDocument()
        expect(screen.getByText('Audit logs')).toBeInTheDocument()
        expect(screen.getByText('Password & 2FA')).toBeInTheDocument()
    })

    it('should render Agent unavailability when feature flag is enabled', () => {
        mockUseCustomAgentUnavailableStatusesFlag.mockReturnValue(true)

        renderSettingsSidebar()
        expect(screen.getByText('Agent unavailability')).toBeInTheDocument()
    })

    it('should not render Agent unavailability when feature flag is disabled', () => {
        mockUseCustomAgentUnavailableStatusesFlag.mockReturnValue(false)

        renderSettingsSidebar()
        expect(
            screen.queryByText('Agent unavailability'),
        ).not.toBeInTheDocument()
    })

    it('should render Imports when historical imports flag is enabled', () => {
        mockUseFlag.mockImplementation((key) => {
            if (key === FeatureFlagKey.HistoricalImports) {
                return true
            }
            return false
        })

        renderSettingsSidebar()
        expect(screen.getByText('Imports')).toBeInTheDocument()
        expect(screen.queryByText('Email Import')).not.toBeInTheDocument()
        expect(screen.queryByText('Zendesk import')).not.toBeInTheDocument()
    })

    it('should render Email Import and Zendesk import when historical imports flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)

        renderSettingsSidebar()
        expect(screen.getByText('Email Import')).toBeInTheDocument()
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
