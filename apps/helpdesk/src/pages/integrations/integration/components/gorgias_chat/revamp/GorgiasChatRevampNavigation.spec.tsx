import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { GorgiasChatMinimumSnippetVersion } from 'models/integration/types'
import { useInstallationStatus } from 'pages/integrations/integration/components/gorgias_chat/hooks/useInstallationStatus'

import { GorgiasChatRevampNavigation } from './GorgiasChatRevampNavigation'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess')

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/hooks/useInstallationStatus',
)

jest.mock(
    'pages/common/components/SecondaryNavbar/SecondaryNavbar',
    () =>
        ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
)

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>
const mockUseAiAgentAccess = useAiAgentAccess as jest.MockedFunction<
    typeof useAiAgentAccess
>
const mockUseInstallationStatus = useInstallationStatus as jest.MockedFunction<
    typeof useInstallationStatus
>

const defaultIntegration = fromJS({
    id: 1,
    meta: { app_id: 'app-123', shop_name: 'my-store' },
})

const installedStatus = {
    installed: true,
    installedOnShopifyCheckout: false,
    embeddedSpqInstalled: false,
    minimumSnippetVersion: GorgiasChatMinimumSnippetVersion.V3,
}

const renderComponent = (integration = defaultIntegration) =>
    render(
        <MemoryRouter>
            <GorgiasChatRevampNavigation integration={integration} />
        </MemoryRouter>,
    )

describe('<GorgiasChatRevampNavigation />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        mockUseFlag.mockReturnValue(false)
        mockUseInstallationStatus.mockReturnValue(installedStatus)
    })

    it('renders Appearance, Preferences and Installation nav links', () => {
        renderComponent()

        expect(screen.getByText('Appearance')).toBeInTheDocument()
        expect(screen.getByText('Preferences')).toBeInTheDocument()
        expect(screen.getByText('Installation')).toBeInTheDocument()
    })

    it('does not render Automation link when hasAccess is false', () => {
        renderComponent()

        expect(screen.queryByText('Automation')).not.toBeInTheDocument()
    })

    it('renders Automation link when hasAccess is true', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        renderComponent()

        expect(screen.getByText('Automation')).toBeInTheDocument()
    })

    it('does not render Language link when ChatMultiLanguages flag is off', () => {
        renderComponent()

        expect(screen.queryByText('Language')).not.toBeInTheDocument()
    })

    it('renders Language link when ChatMultiLanguages flag is on', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.ChatMultiLanguages,
        )

        renderComponent()

        expect(screen.getByText('Language')).toBeInTheDocument()
    })

    it('does not show error dot when installation status is installed', () => {
        renderComponent()

        expect(screen.queryByAltText('status icon')).not.toBeInTheDocument()
    })

    it('shows error dot when installation status is not installed', () => {
        mockUseInstallationStatus.mockReturnValue({
            ...installedStatus,
            installed: false,
        })

        renderComponent()

        expect(screen.getByAltText('status icon')).toBeInTheDocument()
    })

    it('calls useInstallationStatus with the integration appId', () => {
        renderComponent()

        expect(mockUseInstallationStatus).toHaveBeenCalledWith('app-123')
    })

    it('calls useInstallationStatus with undefined when integration has no appId', () => {
        const integrationWithoutAppId = fromJS({ id: 1, meta: {} })

        renderComponent(integrationWithoutAppId)

        expect(mockUseInstallationStatus).toHaveBeenCalledWith(undefined)
    })
})
