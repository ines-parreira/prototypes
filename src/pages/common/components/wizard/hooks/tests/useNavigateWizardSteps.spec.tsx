import React from 'react'

import {fireEvent, render} from '@testing-library/react'

import Wizard from '../../Wizard'
import WizardStep from '../../WizardStep'

import useNavigateWizardSteps from '../useNavigateWizardSteps'

const TestComponent = () => {
    const {goToPreviousStep, goToNextStep} = useNavigateWizardSteps()

    return (
        <>
            <button onClick={goToPreviousStep}>previous</button>
            <button onClick={goToNextStep}>next</button>
        </>
    )
}

describe('useNavigateSteps', () => {
    it('navigates forward and backwards', () => {
        const {container, getByText} = render(
            <Wizard steps={['foo', 'bar', 'baz']} startAt="bar">
                <WizardStep name="foo">step 1</WizardStep>
                <WizardStep name="bar">step 2</WizardStep>
                <WizardStep name="baz">step 3</WizardStep>
                <TestComponent />
            </Wizard>
        )

        expect(container).toHaveTextContent('step 2')

        fireEvent.click(getByText('next'))

        expect(container).toHaveTextContent('step 3')

        fireEvent.click(getByText('previous'))

        expect(container).toHaveTextContent('step 2')
    })
})
