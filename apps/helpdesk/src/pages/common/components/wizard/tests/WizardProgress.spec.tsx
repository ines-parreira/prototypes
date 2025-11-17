import type React from 'react'

import { render } from '@testing-library/react'

import Wizard from '../Wizard'
import WizardProgress from '../WizardProgress'
import WizardStep from '../WizardStep'

describe('<WizardProgress />', () => {
    it('should render', () => {
        const { container } = render(
            <Wizard startAt="bar" steps={['foo', 'bar', 'baz']}>
                <WizardStep name="foo" />

                <WizardStep name="bar" />

                <WizardStep name="baz" />

                <WizardProgress>
                    {
                        ((activeStep: number, totalSteps: number) =>
                            // TODO(React18): Fix this once we upgrade to React 18 types
                            `${activeStep} out of ${totalSteps}`) as unknown as React.ReactNode
                    }
                </WizardProgress>
            </Wizard>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should throw an error if not used inside a WizardContextProvider', () => {
        expect(() =>
            render(
                <WizardProgress>
                    {
                        ((activeStep: number, totalSteps: number) =>
                            // TODO(React18): Fix this once we upgrade to React 18 types
                            `${activeStep} out of ${totalSteps}`) as unknown as React.ReactNode
                    }
                </WizardProgress>,
            ),
        ).toThrow()
    })
})
