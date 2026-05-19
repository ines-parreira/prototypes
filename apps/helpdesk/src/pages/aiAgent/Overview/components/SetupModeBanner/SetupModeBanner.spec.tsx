import { useFlagWithLoading } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { useCurrentUserRole } from '@repo/users'
import { screen } from '@testing-library/react'

import { SetupModeBanner } from 'pages/aiAgent/Overview/components/SetupModeBanner/SetupModeBanner'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(),
}))
jest.mock('@repo/users', () => ({
    ...jest.requireActual('@repo/users'),
    useCurrentUserRole: jest.fn(),
}))
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

const mockUseFlagWithLoading = useFlagWithLoading as jest.Mock
const mockUseCurrentUserRole = useCurrentUserRole as jest.Mock
const mockUseStoreConfigContext =
    useAiAgentStoreConfigurationContext as jest.Mock

const inactiveStoreConfig = {
    chatChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
    emailChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
}

const liveStoreConfig = {
    chatChannelDeactivatedDatetime: null,
    emailChannelDeactivatedDatetime: null,
}

describe('<SetupModeBanner />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })
        mockUseCurrentUserRole.mockReturnValue({ isAdmin: true })
        mockUseStoreConfigContext.mockReturnValue({
            storeConfiguration: inactiveStoreConfig,
            isLoading: false,
        })
    })

    it('renders nothing when V3 flag is off', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        const { container } = render(<SetupModeBanner />)

        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing for non-admins', () => {
        mockUseCurrentUserRole.mockReturnValue({ isAdmin: false })

        const { container } = render(<SetupModeBanner />)

        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when AI Agent is already live on a channel', () => {
        mockUseStoreConfigContext.mockReturnValue({
            storeConfiguration: liveStoreConfig,
            isLoading: false,
        })

        const { container } = render(<SetupModeBanner />)

        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing while store configuration is loading', () => {
        mockUseStoreConfigContext.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: true,
        })

        const { container } = render(<SetupModeBanner />)

        expect(container).toBeEmptyDOMElement()
    })

    it('renders the setup-mode banner for an admin when V3 flag is on and AI Agent is not yet live', () => {
        render(<SetupModeBanner />)

        expect(
            screen.getByText(
                /You're in setup mode. Train and test AI Agent freely before you go live./i,
            ),
        ).toBeInTheDocument()
    })

    it('renders the banner when store configuration is absent (fresh admin pre-deploy)', () => {
        mockUseStoreConfigContext.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: false,
        })

        render(<SetupModeBanner />)

        expect(
            screen.getByText(
                /You're in setup mode. Train and test AI Agent freely before you go live./i,
            ),
        ).toBeInTheDocument()
    })
})
