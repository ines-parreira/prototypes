import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { GorgiasChatCreationWizard } from './GorgiasChatCreationWizard'

const mockUseShouldShowChatSettingsRevamp = jest.fn()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp',
    () => ({
        useShouldShowChatSettingsRevamp: () =>
            mockUseShouldShowChatSettingsRevamp(),
    }),
)

jest.mock(
    './legacy/GorgiasChatCreationWizard/GorgiasChatCreationWizard',
    () => ({
        __esModule: true,
        default: () => <div>Legacy Wizard</div>,
    }),
)

jest.mock(
    './revamp/components/GorgiasChatCreationWizard/GorgiasChatCreationWizard',
    () => ({
        __esModule: true,
        default: () => <div>Revamp Wizard</div>,
    }),
)

jest.mock(
    './revamp/components/GorgiasChatCreationWizard/GorgiasChatCreationWizardSkeleton',
    () => ({
        GorgiasChatCreationWizardSkeleton: () => <div>Skeleton</div>,
    }),
)

const defaultProps = {
    integration: fromJS({ id: 1, name: 'Test Chat' }),
    loading: fromJS({}),
    isUpdate: false,
}

describe('GorgiasChatCreationWizard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders skeleton when loading', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isLoading: true,
        })

        render(<GorgiasChatCreationWizard {...defaultProps} />)

        expect(screen.getByText('Skeleton')).toBeInTheDocument()
        expect(screen.queryByText('Legacy Wizard')).not.toBeInTheDocument()
        expect(screen.queryByText('Revamp Wizard')).not.toBeInTheDocument()
    })

    it('renders Legacy wizard when isChatSettingsRevampEnabled is false', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: false,
            isLoading: false,
        })

        render(<GorgiasChatCreationWizard {...defaultProps} />)

        expect(screen.getByText('Legacy Wizard')).toBeInTheDocument()
        expect(screen.queryByText('Revamp Wizard')).not.toBeInTheDocument()
    })

    it('renders Revamp wizard when isChatSettingsRevampEnabled is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            isChatSettingsRevampEnabled: true,
            isLoading: false,
        })

        render(<GorgiasChatCreationWizard {...defaultProps} />)

        expect(screen.getByText('Revamp Wizard')).toBeInTheDocument()
        expect(screen.queryByText('Legacy Wizard')).not.toBeInTheDocument()
    })
})
