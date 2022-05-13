import React, {useContext} from 'react'
import {render} from '@testing-library/react'
import {useEffectOnce} from 'react-use'

import Wizard, {WizardContext} from '../Wizard'

describe('<Wizard />', () => {
    const defaultProps = {
        startAt: 'bar',
        steps: ['foo', 'bar', 'baz'],
    }

    const MockSetActiveStepComponent = () => {
        const context = useContext(WizardContext)

        if (!context) {
            throw new Error('Component is used outside of Provider')
        }

        useEffectOnce(() => {
            context.setActiveStep('foo')
        })

        return <>{context.activeStep}</>
    }

    it('should accept a starting step', () => {
        const {getByText} = render(
            <Wizard {...defaultProps}>
                <WizardContext.Consumer>
                    {(context) => context && context.activeStep}
                </WizardContext.Consumer>
            </Wizard>
        )

        expect(getByText(/bar/)).toBeTruthy()
    })

    it('should provide next and previous steps', () => {
        const {getByText} = render(
            <Wizard {...defaultProps}>
                <WizardContext.Consumer>
                    {(context) => {
                        if (!context) {
                            return null
                        }

                        return `previousStep:${
                            context.previousStep || ''
                        } nextStep:${context.nextStep || ''}`
                    }}
                </WizardContext.Consumer>
            </Wizard>
        )

        expect(getByText(/previousStep:foo nextStep:baz/)).toBeTruthy()
    })

    it('should set an active step', () => {
        const {getByText} = render(
            <Wizard {...defaultProps}>
                <MockSetActiveStepComponent />
            </Wizard>
        )

        expect(getByText(/foo/)).toBeTruthy()
    })

    it('should throw an error if startAt is not included in steps', () => {
        expect(() =>
            render(
                <Wizard {...defaultProps} steps={['foo']}>
                    Foo
                </Wizard>
            )
        ).toThrow()
    })

    it('should throw an error if steps is empty', () => {
        expect(() => render(<Wizard steps={[]}>Foo</Wizard>)).toThrow()
    })

    it('should keep the active step when steps change but includes active step', () => {
        const {getByText, rerender} = render(
            <Wizard {...defaultProps}>
                <WizardContext.Consumer>
                    {(context) => context && context.activeStep}
                </WizardContext.Consumer>
            </Wizard>
        )
        rerender(
            <Wizard {...defaultProps} steps={['foo', 'bar']}>
                <WizardContext.Consumer>
                    {(context) => context && context.activeStep}
                </WizardContext.Consumer>
            </Wizard>
        )

        expect(getByText(/bar/)).toBeTruthy()
    })

    it('should fallback to the startAt step when steps change and include startAt but not the active step', () => {
        const {getByText, rerender} = render(
            <Wizard {...defaultProps}>
                <MockSetActiveStepComponent />
            </Wizard>
        )
        rerender(
            <Wizard {...defaultProps} steps={['bar']}>
                <WizardContext.Consumer>
                    {(context) => context && context.activeStep}
                </WizardContext.Consumer>
            </Wizard>
        )

        expect(getByText(/bar/)).toBeTruthy()
    })

    it("should fallback to the first available step when steps change and doesn't include startAt nor the active step", () => {
        const {getByText, rerender} = render(
            <Wizard {...defaultProps}>
                <MockSetActiveStepComponent />
            </Wizard>
        )
        rerender(
            <Wizard {...defaultProps} steps={['baz']}>
                <WizardContext.Consumer>
                    {(context) => context && context.activeStep}
                </WizardContext.Consumer>
            </Wizard>
        )

        expect(getByText(/baz/)).toBeTruthy()
    })
})
