import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import GorgiasChatCreationWizardSwitcher from '../index'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

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

    it('renders Legacy wizard when feature flag is disabled', async () => {
        mockUseFlag.mockReturnValue(false)

        render(<GorgiasChatCreationWizardSwitcher {...defaultProps} />)

        expect(mockUseFlag).toHaveBeenCalledWith(
            FeatureFlagKey.ChatSettingsRevamp,
        )
        expect(await screen.findByTestId('legacy-wizard')).toBeInTheDocument()
        expect(screen.queryByTestId('revamp-wizard')).not.toBeInTheDocument()
    })

    it('renders Revamp wizard when feature flag is enabled', async () => {
        mockUseFlag.mockReturnValue(true)

        render(<GorgiasChatCreationWizardSwitcher {...defaultProps} />)

        expect(mockUseFlag).toHaveBeenCalledWith(
            FeatureFlagKey.ChatSettingsRevamp,
        )
        expect(await screen.findByTestId('revamp-wizard')).toBeInTheDocument()
        expect(screen.queryByTestId('legacy-wizard')).not.toBeInTheDocument()
    })
})
