import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import GorgiasChatCreationWizardSwitcher from '../index'

const mockUseShouldShowChatSettingsRevamp = jest.fn()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp',
    () => ({
        __esModule: true,
        default: () => mockUseShouldShowChatSettingsRevamp(),
    }),
)

jest.mock('../GorgiasChatCreationWizard', () => ({
    __esModule: true,
    default: () => <div data-testid="legacy-wizard">Legacy Wizard</div>,
}))

jest.mock('../revamp/GorgiasChatCreationWizard', () => ({
    __esModule: true,
    default: () => <div data-testid="revamp-wizard">Revamp Wizard</div>,
}))

const defaultProps = {
    integration: fromJS({ id: 1, name: 'Test Chat' }),
    loading: fromJS({}),
    isUpdate: false,
}

describe('GorgiasChatCreationWizardSwitcher', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders Legacy wizard when shouldShowRevamp is false', async () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: false,
            shouldShowPreviewForRevamp: true,
        })

        render(<GorgiasChatCreationWizardSwitcher {...defaultProps} />)

        expect(await screen.findByTestId('legacy-wizard')).toBeInTheDocument()
        expect(screen.queryByTestId('revamp-wizard')).not.toBeInTheDocument()
    })

    it('renders Revamp wizard when shouldShowRevamp is true', async () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowRevamp: true,
            shouldShowPreviewForRevamp: false,
        })

        render(<GorgiasChatCreationWizardSwitcher {...defaultProps} />)

        expect(await screen.findByTestId('revamp-wizard')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-wizard')).not.toBeInTheDocument()
    })
})
