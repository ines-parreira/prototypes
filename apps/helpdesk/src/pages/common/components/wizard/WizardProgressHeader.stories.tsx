import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { LegacyButton as Button, MultiButton } from '@gorgias/axiom'

import Wizard, { WizardContext } from './Wizard'
import WizardProgressHeader from './WizardProgressHeader'
import WizardStep from './WizardStep'

const storyConfig: Meta = {
    title: 'General/Wizard container/WizardProgressHeader',
    component: WizardProgressHeader,
}

type TemplateProps = ComponentProps<typeof WizardProgressHeader>

const Template: StoryObj<TemplateProps> = {
    render: function Template() {
        return (
            <Wizard
                startAt="branding"
                steps={['basics', 'branding', 'installation']}
            >
                <WizardProgressHeader
                    labels={{
                        basics: 'Set up the basics',
                        branding: 'Branding',
                        installation: 'Installation',
                    }}
                    className="mb-3"
                />

                <WizardStep name="basics" />

                <WizardStep name="branding" />

                <WizardStep name="installation" />

                <WizardContext.Consumer>
                    {(context) => (
                        <>
                            <MultiButton>
                                <Button
                                    intent="secondary"
                                    onClick={() =>
                                        context?.setActiveStep(
                                            context.previousStep!,
                                        )
                                    }
                                    isDisabled={!context?.previousStep}
                                >
                                    Previous step
                                </Button>

                                <Button
                                    onClick={() =>
                                        context?.setActiveStep(
                                            context.nextStep!,
                                        )
                                    }
                                    isDisabled={!context?.nextStep}
                                >
                                    Next step
                                </Button>
                            </MultiButton>
                        </>
                    )}
                </WizardContext.Consumer>
            </Wizard>
        )
    },
}

export const Default = {
    ...Template,
}

export default storyConfig
