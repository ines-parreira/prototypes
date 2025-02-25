import React from 'react'

import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import 'tests/__mocks__/intersectionObserverMock'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { shopifyIntegration } from 'fixtures/integrations'
import {
    HelpCenter,
    HelpCenterAutomateType,
    HelpCenterCreationWizardStep,
} from 'models/helpCenter/types'
import { Integration } from 'models/integration/types'
import Wizard from 'pages/common/components/wizard/Wizard'
import { NEXT_ACTION } from 'pages/settings/helpCenter/constants'
import {
    HelpCenterApiBasicsFixture,
    HelpCenterUiBasicsFixture,
} from 'pages/settings/helpCenter/fixtures/wizard.fixture'
import { SupportedLocalesProvider } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { StoreState } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import { useHelpCenterCreationWizard } from '../../../hooks/useHelpCenterCreationWizard'
import HelpCenterCreationWizardStepBasics from '../HelpCenterCreationWizardStepBasics'

const defaultHelpCenter = HelpCenterUiBasicsFixture

jest.mock('../../../hooks/useHelpCenterCreationWizard', () => ({
    useHelpCenterCreationWizard: jest.fn(),
}))
jest.mock('models/helpCenter/queries', () => ({
    useCheckHelpCenterWithSubdomainExists: () => ({
        mutateAsync: mockCheckDomainMutateAsync,
        isError: true,
    }),
}))

const mockUseHelpCenterCreationWizard = jest.mocked(useHelpCenterCreationWizard)
const mockOnSave = jest.fn()
const mockUpdateData = jest.fn()
const mockCheckDomainMutateAsync = jest.fn()

const mockedHook = {
    helpCenter: defaultHelpCenter,
    allStoreIntegrations: [shopifyIntegration],
    isLoading: false,
    handleFormUpdate: mockUpdateData,
    handleSave: mockOnSave,
    handleAction: jest.fn(),
}

const renderComponent = (fixtures?: {
    integrations?: Integration[]
    helpCenter?: HelpCenter
    automateType?: HelpCenterAutomateType
}) => {
    const {
        integrations = [shopifyIntegration],
        helpCenter = HelpCenterApiBasicsFixture,
        automateType = HelpCenterAutomateType.AUTOMATE,
    } = fixtures ?? {}

    const defaultStore = {
        integrations: fromJS({ integrations }),
    } as unknown as StoreState

    const mockStore = configureMockStore([thunk])

    renderWithRouter(
        <Provider store={mockStore(defaultStore)}>
            <SupportedLocalesProvider>
                <Wizard steps={[HelpCenterCreationWizardStep.Basics]}>
                    <HelpCenterCreationWizardStepBasics
                        isUpdate={false}
                        helpCenter={helpCenter}
                        automateType={automateType}
                    />
                </Wizard>
            </SupportedLocalesProvider>
        </Provider>,
    )
}

describe('<HelpCenterCreationWizardStepBasics />', () => {
    beforeEach(() => {
        mockUseHelpCenterCreationWizard.mockReturnValue(mockedHook)
    })

    it('renders wizard with default options selected', () => {
        renderComponent({})

        const brandInput = screen.getByTestId('name')
        const subdomainInput = screen.getByRole('textbox', {
            name: /subdomain/i,
        })
        const defaultLanguageLabel = screen.getByText(/default language/i)
        const platformTypeLabel = screen.queryByText(/Select a platform type/i)

        expect(brandInput).toBeInTheDocument()
        expect(subdomainInput).toBeInTheDocument()
        expect(defaultLanguageLabel).toBeInTheDocument()
        expect(platformTypeLabel).not.toBeInTheDocument()
    })

    it('renders wizard with platform type when non Automate account', () => {
        renderComponent({ automateType: HelpCenterAutomateType.NON_AUTOMATE })

        const platformTypeLabel = screen.getByText(/Select a platform type/i)

        expect(platformTypeLabel).toBeInTheDocument()
    })

    it('renders wizard with platform type when no store connected', () => {
        renderComponent({
            automateType: HelpCenterAutomateType.AUTOMATE_NO_STORE,
        })

        const platformTypeLabel = screen.getByText(/Select a platform type/i)

        expect(platformTypeLabel).toBeInTheDocument()
    })

    it('should trigger error at field level when action button is clicked', () => {
        mockUseHelpCenterCreationWizard.mockReturnValue({
            ...mockedHook,
            helpCenter: {
                ...defaultHelpCenter,
                name: '',
            },
        })

        renderComponent()

        userEvent.click(screen.getByText('Create & Customize'))

        const errorMessages = screen.getAllByText('This field is required.')
        expect(errorMessages).toHaveLength(1)
    })

    it('should call onSave method when all fields are valid', () => {
        renderComponent()

        userEvent.click(screen.getByText('Create & Customize'))

        expect(mockOnSave).toHaveBeenCalledWith({
            redirectTo: NEXT_ACTION.NEW_WIZARD,
            stepName: HelpCenterCreationWizardStep.Branding,
        })
    })

    it('should call updateData method when a field is updated', () => {
        renderComponent()

        const brandInput = screen.getByTestId('name')
        fireEvent.change(brandInput, { target: { value: 'updated name' } })

        expect(mockUpdateData).toHaveBeenCalledWith({
            name: 'updated name',
            subdomain: 'updated-name',
        })
    })

    it('should check subdomain when value is updated', async () => {
        renderComponent()

        const subdomainInput = screen.getByRole('textbox', {
            name: /subdomain/i,
        })

        fireEvent.change(subdomainInput, {
            target: { value: 'custom-subdomain' },
        })

        await waitFor(() => {
            expect(mockCheckDomainMutateAsync).toHaveBeenCalled()
        })
    })
})
