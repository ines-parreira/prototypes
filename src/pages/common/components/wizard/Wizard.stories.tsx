import React, {ComponentProps, useState} from 'react'
import {Meta, Story} from '@storybook/react'

import Button from 'pages/common/components/button/Button'
import Group from 'pages/common/components/layout/Group'

import Wizard, {WizardContext} from './Wizard'
import WizardStep from './WizardStep'
import WizardProgress from './WizardProgress'

const storyConfig: Meta = {
    title: 'General/Wizard container/Wizard',
    component: Wizard,
}

const Template: Story<ComponentProps<typeof Wizard>> = (props) => {
    const [hasExtraStep, setHasExtraStep] = useState(false)

    return (
        <Wizard
            {...props}
            steps={
                hasExtraStep
                    ? [
                          ...props.steps.slice(undefined, 2),
                          'extra',
                          ...props.steps.slice(2),
                      ]
                    : props.steps
            }
        >
            <WizardStep name="foo">
                <WizardContext.Consumer>
                    {(context) => (
                        <>
                            <h3>Step 1</h3>

                            <Button
                                onClick={() =>
                                    context?.setActiveStep(context.nextStep!)
                                }
                            >
                                Next step
                            </Button>
                        </>
                    )}
                </WizardContext.Consumer>
            </WizardStep>

            <WizardStep name="bar">
                <WizardContext.Consumer>
                    {(context) => (
                        <>
                            <h3>Step 2</h3>

                            <Group>
                                <Button
                                    intent="secondary"
                                    onClick={() =>
                                        context?.setActiveStep(
                                            context.previousStep!
                                        )
                                    }
                                >
                                    Previous step
                                </Button>

                                <Button
                                    onClick={() =>
                                        context?.setActiveStep(
                                            context.nextStep!
                                        )
                                    }
                                >
                                    Next step
                                </Button>
                            </Group>

                            <label style={{display: 'block', marginTop: 8}}>
                                <input
                                    checked={hasExtraStep}
                                    onChange={() =>
                                        setHasExtraStep(!hasExtraStep)
                                    }
                                    type="checkbox"
                                />
                                Add extra step
                            </label>
                        </>
                    )}
                </WizardContext.Consumer>
            </WizardStep>

            <WizardStep name="extra">
                <WizardContext.Consumer>
                    {(context) => (
                        <>
                            <h3>Step 2.5</h3>

                            <Group>
                                <Button
                                    intent="secondary"
                                    onClick={() =>
                                        context?.setActiveStep(
                                            context.previousStep!
                                        )
                                    }
                                >
                                    Previous step
                                </Button>

                                <Button
                                    onClick={() =>
                                        context?.setActiveStep(
                                            context.nextStep!
                                        )
                                    }
                                >
                                    Next step
                                </Button>
                            </Group>
                        </>
                    )}
                </WizardContext.Consumer>
            </WizardStep>

            <WizardStep name="baz">
                <WizardContext.Consumer>
                    {(context) => (
                        <>
                            <h3>Step 3</h3>

                            <Button
                                intent="secondary"
                                onClick={() =>
                                    context?.setActiveStep(
                                        context.previousStep!
                                    )
                                }
                            >
                                Previous step
                            </Button>
                        </>
                    )}
                </WizardContext.Consumer>
            </WizardStep>

            <WizardProgress style={{marginTop: 8}}>
                {(activeStepIndex, totalSteps) =>
                    `${activeStepIndex} out of ${totalSteps}`
                }
            </WizardProgress>
        </Wizard>
    )
}

export const Default = Template.bind({})
Default.args = {
    startAt: 'foo',
    steps: ['foo', 'bar', 'baz'],
}

export default storyConfig
