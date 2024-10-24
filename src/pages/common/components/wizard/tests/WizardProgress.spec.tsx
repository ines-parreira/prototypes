import {render} from '@testing-library/react'
import React from 'react'

import Wizard from '../Wizard'
import WizardProgress from '../WizardProgress'
import WizardStep from '../WizardStep'

describe('<WizardProgress />', () => {
    it('should render', () => {
        const {container} = render(
            <Wizard startAt="bar" steps={['foo', 'bar', 'baz']}>
                <WizardStep name="foo" />

                <WizardStep name="bar" />

                <WizardStep name="baz" />

                <WizardProgress>
                    {(activeStep, totalSteps) =>
                        `${activeStep} out of ${totalSteps}`
                    }
                </WizardProgress>
            </Wizard>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should throw an error if not used inside a WizardContextProvider', () => {
        expect(() =>
            render(
                <WizardProgress>
                    {(activeStep, totalSteps) =>
                        `${activeStep} out of ${totalSteps}`
                    }
                </WizardProgress>
            )
        ).toThrow()
    })
})
