import 'tests/__mocks__/intersectionObserverMock'

import React, {ComponentProps} from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {WizardContext} from 'pages/common/components/wizard/Wizard'
import {HelpCenterCreationWizardStep} from 'models/helpCenter/types'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import HelpCenterCreationWizardStepAutomate from '../HelpCenterCreationWizardStepAutomate'

const helpCenterFixture = getHelpCentersResponseFixture.data[0]

const renderComponent = (
    props: Partial<ComponentProps<typeof HelpCenterCreationWizardStepAutomate>>
) => {
    render(
        <WizardContext.Provider
            value={{
                steps: [HelpCenterCreationWizardStep.Automate],
                activeStepIndex: 0,
                setActiveStep: jest.fn(),
                totalSteps: 1,
                activeStep: HelpCenterCreationWizardStep.Automate,
                nextStep: undefined,
                previousStep: undefined,
            }}
        >
            <WizardStep name={HelpCenterCreationWizardStep.Automate}>
                <HelpCenterCreationWizardStepAutomate
                    isUpdate={false}
                    helpCenter={helpCenterFixture}
                    {...props}
                />
            </WizardStep>
        </WizardContext.Provider>
    )
}

describe('<HelpCenterCreationWizardStepAutomate />', () => {
    it('should render', () => {
        renderComponent({})

        expect(screen.getAllByText('Automate')[0]).toBeInTheDocument()
        expect(screen.getByText('Order management')).toBeInTheDocument()
    })

    describe('order management', () => {
        it('should render disabled order management when order management in help center disabled', () => {
            const helpCenter = {
                ...helpCenterFixture,
                self_service_deactivated_datetime: null,
            }
            renderComponent({helpCenter})

            expect(
                screen.getByLabelText(
                    'Allow customers to manage orders from my Help Center'
                )
            ).not.toBeChecked()
        })
        it('should render enabled order management when order management is enabled', () => {
            const helpCenter = {
                ...helpCenterFixture,
                self_service_deactivated_datetime: '2021-05-17T18:21:42.022Z',
            }
            renderComponent({helpCenter})

            expect(
                screen.getByLabelText(
                    'Allow customers to manage orders from my Help Center'
                )
            ).toBeChecked()
        })

        it('should enabled order management when toggle from disabled', () => {
            const helpCenter = {
                ...helpCenterFixture,
                self_service_deactivated_datetime: null,
            }
            renderComponent({helpCenter})

            // userEvent not working here. I don't find the reason why
            fireEvent.click(
                screen.getByLabelText(
                    'Allow customers to manage orders from my Help Center'
                )
            )

            expect(
                screen.getByLabelText(
                    'Allow customers to manage orders from my Help Center'
                )
            ).toBeChecked()
        })
    })
})
