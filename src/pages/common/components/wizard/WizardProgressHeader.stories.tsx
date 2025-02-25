import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import Button from 'pages/common/components/button/Button'
import Group from 'pages/common/components/layout/Group'

import Wizard, { WizardContext } from './Wizard'
import WizardProgressHeader from './WizardProgressHeader'
import WizardStep from './WizardStep'

const storyConfig: Meta = {
    title: 'General/Wizard container/WizardProgressHeader',
    component: WizardProgressHeader,
}

const Template: Story<ComponentProps<typeof WizardProgressHeader>> = () => {
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
                        <Group>
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
                                    context?.setActiveStep(context.nextStep!)
                                }
                                isDisabled={!context?.nextStep}
                            >
                                Next step
                            </Button>
                        </Group>
                    </>
                )}
            </WizardContext.Consumer>
        </Wizard>
    )
}

export const Default = Template.bind({})

export default storyConfig
