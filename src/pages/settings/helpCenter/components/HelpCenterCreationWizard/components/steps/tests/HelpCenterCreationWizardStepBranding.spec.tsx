import 'tests/__mocks__/intersectionObserverMock'

import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import Wizard from 'pages/common/components/wizard/Wizard'
import {HelpCenterCreationWizardStep} from 'models/helpCenter/types'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import HelpCenterCreationWizardStepBranding from '../HelpCenterCreationWizardStepBranding'
import {useHelpCenterCreationWizard} from '../../../hooks/useHelpCenterCreationWizard'
import {mapApiHelpCenterToUIHelpCenter} from '../../../HelpCenterCreationWizardUtils'

const helpCenterFixture = getHelpCentersResponseFixture.data[0]
const helpCenterFixtureUI = mapApiHelpCenterToUIHelpCenter(
    helpCenterFixture,
    []
)

jest.mock('../../../hooks/useHelpCenterCreationWizard', () => ({
    useHelpCenterCreationWizard: jest.fn(),
}))
const mockUseHelpCenterCreationWizard = jest.mocked(useHelpCenterCreationWizard)
const mockedHook = {
    helpCenter: helpCenterFixtureUI,
    allStoreIntegrations: [],
    handleFormUpdate: jest.fn(),
    handleSave: jest.fn(),
    handleAction: jest.fn(),
    isLoading: false,
}

const renderComponent = () => {
    render(
        <CurrentHelpCenterContext.Provider value={helpCenterFixture}>
            <Wizard steps={[HelpCenterCreationWizardStep.Branding]}>
                <HelpCenterCreationWizardStepBranding
                    helpCenter={helpCenterFixture}
                />
            </Wizard>
        </CurrentHelpCenterContext.Provider>
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
                ...helpCenterFixtureUI,
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
                ...helpCenterFixtureUI,
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
                ...helpCenterFixtureUI,
                brandLogoUrl: 'https://test.com/test.png',
            },
        })
        renderComponent()
        expect(screen.queryByTestId('image-upload-preview')).toHaveAttribute(
            'src',
            'https://test.com/test.png'
        )
    })

    it('should update primary color', () => {
        renderComponent()

        const colorPickerInput = screen.getByTestId('color-picker-input')
        fireEvent.change(colorPickerInput, {target: {value: '#000000'}})

        expect(mockedHook.handleFormUpdate).toHaveBeenCalledWith({
            primaryColor: '#000000',
        })
    })

    it('should update primary font family', async () => {
        renderComponent()

        await waitFor(() =>
            expect(screen.getByText('Verdana')).toBeInTheDocument()
        )

        fireEvent.click(screen.getByText('Verdana'))

        expect(mockedHook.handleFormUpdate).toHaveBeenCalledWith({
            primaryFontFamily: 'Verdana',
        })
    })
})
