import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { GorgiasChatCreationWizard } from './GorgiasChatCreationWizard'

const mockUseShouldShowChatSettingsRevamp = jest.fn()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp',
    () => ({
        __esModule: true,
        default: () => mockUseShouldShowChatSettingsRevamp(),
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
    './legacy/GorgiasChatCreationWizard/revamp/GorgiasChatCreationWizard',
    () => ({
        __esModule: true,
        default: () => <div>Revamp Wizard</div>,
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

    it('renders Legacy wizard when shouldShowRevamp is false', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: false,
        })

        render(<GorgiasChatCreationWizard {...defaultProps} />)

        expect(screen.getByText('Legacy Wizard')).toBeInTheDocument()
        expect(screen.queryByText('Revamp Wizard')).not.toBeInTheDocument()
    })

    it('renders Revamp wizard when shouldShowRevamp is true', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: true,
        })

        render(<GorgiasChatCreationWizard {...defaultProps} />)

        expect(screen.getByText('Revamp Wizard')).toBeInTheDocument()
        expect(screen.queryByText('Legacy Wizard')).not.toBeInTheDocument()
    })
})
