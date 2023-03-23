import React, {useContext} from 'react'
import {fireEvent, render} from '@testing-library/react'

import Wizard, {WizardContext} from '../Wizard'
import WizardStep from '../WizardStep'
import WizardProgressHeader from '../WizardProgressHeader'

const MockNextStepComponent = () => {
    const context = useContext(WizardContext)

    if (!context) {
        throw new Error('Component is used outside of Provider')
    }

    return (
        <div
            data-testid="next"
            onClick={() =>
                context.nextStep && context.setActiveStep(context.nextStep)
            }
        >
            next
        </div>
    )
}

describe('<WizardProgressHeader />', () => {
    it('should render steps', () => {
        const {getByText, getByTestId} = render(
            <Wizard startAt="bar" steps={['foo', 'bar', 'baz']}>
                <WizardProgressHeader
                    labels={{foo: 'Step 1', bar: 'Step 2', baz: 'Step 3'}}
                />

                <WizardStep name="foo" />

                <WizardStep name="bar" />

                <WizardStep name="baz" />

                <MockNextStepComponent />
            </Wizard>
        )

        expect(getByText('Step 1')).toHaveClass('previousStep')
        expect(getByText('Step 2')).toHaveClass('activeStep')

        fireEvent.click(getByTestId('next'))

        expect(getByText('Step 2')).toHaveClass('previousStep')
        expect(getByText('Step 3')).toHaveClass('activeStep')
    })

    it('should throw an error if not used inside a WizardContextProvider', () => {
        expect(() => render(<WizardProgressHeader labels={{}} />)).toThrow()
    })
})
