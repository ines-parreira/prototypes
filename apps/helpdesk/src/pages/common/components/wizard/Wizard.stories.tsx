import type { ComponentProps } from 'react'
import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { LegacyButton as Button, MultiButton } from '@gorgias/axiom'

import Wizard, { WizardContext } from './Wizard'
import WizardProgress from './WizardProgress'
import WizardStep from './WizardStep'

const storyConfig: Meta = {
    title: 'General/Wizard container/Wizard',
    component: Wizard,
}

type TemplateProps = ComponentProps<typeof Wizard>

const Template: StoryObj<TemplateProps> = {
    render: function Template({ ...props }) {
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
                                        context?.setActiveStep(
                                            context.nextStep!,
                                        )
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

                                <MultiButton>
                                    <Button
                                        intent="secondary"
                                        onClick={() =>
                                            context?.setActiveStep(
                                                context.previousStep!,
                                            )
                                        }
                                    >
                                        Previous step
                                    </Button>

                                    <Button
                                        onClick={() =>
                                            context?.setActiveStep(
                                                context.nextStep!,
                                            )
                                        }
                                    >
                                        Next step
                                    </Button>
                                </MultiButton>

                                <label
                                    style={{ display: 'block', marginTop: 8 }}
                                >
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

                                <MultiButton>
                                    <Button
                                        intent="secondary"
                                        onClick={() =>
                                            context?.setActiveStep(
                                                context.previousStep!,
                                            )
                                        }
                                    >
                                        Previous step
                                    </Button>

                                    <Button
                                        onClick={() =>
                                            context?.setActiveStep(
                                                context.nextStep!,
                                            )
                                        }
                                    >
                                        Next step
                                    </Button>
                                </MultiButton>
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
                                            context.previousStep!,
                                        )
                                    }
                                >
                                    Previous step
                                </Button>
                            </>
                        )}
                    </WizardContext.Consumer>
                </WizardStep>

                <WizardProgress style={{ marginTop: 8 }}>
                    {
                        ((activeStepIndex: number, totalSteps: number) =>
                            // TODO(React18): Fix this once we upgrade to React 18 types
                            `${activeStepIndex} out of ${totalSteps}`) as unknown as React.ReactNode
                    }
                </WizardProgress>
            </Wizard>
        )
    },
}

export const Default = {
    ...Template,
    args: {
        startAt: 'foo',
        steps: ['foo', 'bar', 'baz'],
    },
}

export default storyConfig
