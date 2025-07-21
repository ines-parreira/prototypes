import 'tests/__mocks__/intersectionObserverMock'

import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    HelpCenter,
    HelpCenterCreationWizardStep,
} from 'models/helpCenter/types'
import Wizard from 'pages/common/components/wizard/Wizard'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import {
    HelpCenterApiBrandingFixture,
    HelpCenterUiBrandingFixture,
} from 'pages/settings/helpCenter/fixtures/wizard.fixture'
import { HelpCenterLayout } from 'pages/settings/helpCenter/types/layout.enum'

import { useHelpCenterCreationWizard } from '../../../hooks/useHelpCenterCreationWizard'
import HelpCenterCreationWizardStepBranding from '../HelpCenterCreationWizardStepBranding'

jest.mock('../../../hooks/useHelpCenterCreationWizard', () => ({
    useHelpCenterCreationWizard: jest.fn(),
}))
const mockUseHelpCenterCreationWizard = jest.mocked(useHelpCenterCreationWizard)
const mockedHook = {
    helpCenter: HelpCenterUiBrandingFixture,
    allStoreIntegrations: [],
    isLoading: false,
    handleFormUpdate: jest.fn(),
    handleSave: jest.fn(),
    handleAction: jest.fn(),
}

const store = configureMockStore([thunk])()

const renderComponent = (fixtures?: { helpCenter?: HelpCenter }) => {
    const { helpCenter = HelpCenterApiBrandingFixture } = fixtures ?? {}

    render(
        <Provider store={store}>
            <CurrentHelpCenterContext.Provider value={helpCenter}>
                <Wizard steps={[HelpCenterCreationWizardStep.Branding]}>
                    <HelpCenterCreationWizardStepBranding
                        helpCenter={helpCenter}
                    />
                </Wizard>
            </CurrentHelpCenterContext.Provider>
        </Provider>,
    )
}

describe('<HelpCenterCreationWizardStepBranding />', () => {
    beforeEach(() => {
        mockUseHelpCenterCreationWizard.mockReturnValue(mockedHook)
    })
    it('should render', () => {
        renderComponent()

        expect(screen.getAllByText('Add your branding')[0]).toBeInTheDocument()
    })

    it('should render primary color when primary color is in help center', () => {
        mockUseHelpCenterCreationWizard.mockReturnValue({
            ...mockedHook,
            helpCenter: {
                ...HelpCenterUiBrandingFixture,
                primaryColor: '#000000',
            },
        })
        renderComponent()
        expect(screen.getByTestId('color-picker-input')).toHaveValue('#000000')
    })

    it('should render primary font family when primary font family is in help center', () => {
        mockUseHelpCenterCreationWizard.mockReturnValue({
            ...mockedHook,
            helpCenter: {
                ...HelpCenterUiBrandingFixture,
                primaryFontFamily: 'Test Font',
            },
        })
        renderComponent()
        expect(screen.queryAllByText('Test Font')).toHaveLength(1)
    })

    it('should render brand logo when brand logo is in help center', () => {
        mockUseHelpCenterCreationWizard.mockReturnValue({
            ...mockedHook,
            helpCenter: {
                ...HelpCenterUiBrandingFixture,
                brandLogoUrl: 'https://test.com/test.png',
            },
        })
        renderComponent()
        expect(screen.queryByTestId('image-upload-preview')).toHaveAttribute(
            'src',
            'https://test.com/test.png',
        )
    })

    it('should update primary color', () => {
        renderComponent()

        const colorPickerInput = screen.getByTestId('color-picker-input')
        fireEvent.change(colorPickerInput, { target: { value: '#000000' } })

        expect(mockedHook.handleFormUpdate).toHaveBeenCalledWith({
            primaryColor: '#000000',
        })
    })

    it('should update primary font family', async () => {
        renderComponent()

        await waitFor(() =>
            expect(screen.getByText('Verdana')).toBeInTheDocument(),
        )

        fireEvent.click(screen.getByText('Verdana'))

        expect(mockedHook.handleFormUpdate).toHaveBeenCalledWith({
            primaryFontFamily: 'Verdana',
        })
    })

    it('should update help center layout', () => {
        mockFlags({
            [FeatureFlagKey.HelpCenterOnePager]: true,
        })

        renderComponent()
        fireEvent.click(screen.getByText('1 page layout'))

        expect(mockedHook.handleFormUpdate).toHaveBeenCalledWith({
            layout: HelpCenterLayout.ONEPAGER,
        })
    })
})
