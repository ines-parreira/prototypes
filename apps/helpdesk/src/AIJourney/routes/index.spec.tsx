import type React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { AiJourneyRoutes } from './index'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(() => false),
}))

jest.mock('AIJourney/providers', () => ({
    JourneyProvider: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
}))

jest.mock('pages/App', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('AIJourney/components', () => ({
    AiJourneyNavbar: () => <div>AiJourneyNavbar</div>,
}))

jest.mock('AIJourney/pages', () => ({
    AiJourneyOnboarding: ({ step }: { step: string }) => (
        <div>AiJourneyOnboarding-{step}</div>
    ),
    Analytics: () => <div>Analytics</div>,
    Flows: () => <div>Flows</div>,
    JourneyEditorLayout: ({ step }: { step: string }) => (
        <div>JourneyEditorLayout-{step}</div>
    ),
    Playground: () => <div>Playground</div>,
    Segments: () => <div>Segments</div>,
    Settings: () => <div>Settings</div>,
    CustomFlowWebhookSetup: () => <div>CustomFlowWebhookSetup</div>,
}))

jest.mock('AIJourney/pages/Campaigns/Campaigns', () => ({
    Campaigns: () => <div>Campaigns</div>,
}))

jest.mock('../../domains/reporting/pages/DefaultStatsFilters', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('./RedirectToShop', () => ({
    RedirectToShop: ({ basePath }: { basePath: string }) => (
        <div>RedirectToShop-{basePath}</div>
    ),
}))

const mockStore = configureMockStore([thunk])()

const renderRoutes = (initialPath: string) =>
    render(
        <Provider store={mockStore}>
            <MemoryRouter initialEntries={[initialPath]}>
                <Route path="/app/ai-journey">
                    <AiJourneyRoutes />
                </Route>
            </MemoryRouter>
        </Provider>,
    )

describe('<AiJourneyRoutes />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        const mockUseFlag = require('@repo/feature-flags').useFlag as jest.Mock
        mockUseFlag.mockReturnValue(false)
    })

    it('should render RedirectToShop at the exact base path', () => {
        renderRoutes('/app/ai-journey/')

        expect(screen.getByText(/RedirectToShop/)).toBeInTheDocument()
    })

    it('should render AiJourneyOnboarding at a journey step when V3 architecture FF is disabled', () => {
        renderRoutes('/app/ai-journey/test-store/win-back/setup')

        expect(
            screen.getByText(/AiJourneyOnboarding-setup/),
        ).toBeInTheDocument()
    })

    it('should render JourneyEditorLayout at a journey step when V3 architecture FF is enabled', () => {
        const mockUseFlag = require('@repo/feature-flags').useFlag as jest.Mock
        mockUseFlag.mockImplementation(
            (flag: string) =>
                flag === FeatureFlagKey.AiJourneyV3ArchitectureEnabled,
        )

        renderRoutes('/app/ai-journey/test-store/win-back/setup')

        expect(
            screen.getByText('JourneyEditorLayout-setup'),
        ).toBeInTheDocument()
    })
})
