import { ComponentProps } from 'react'

import { Meta, StoryObj } from '@storybook/react'

import Wizard from './Wizard'
import WizardProgress from './WizardProgress'
import WizardStep from './WizardStep'

const storyConfig: Meta = {
    title: 'General/Wizard container/WizardProgress',
    component: WizardProgress,
}

type TemplateProps = ComponentProps<typeof WizardProgress>

const Template: StoryObj<TemplateProps> = {
    render: function Template({ ...props }) {
        return (
            <Wizard startAt="bar" steps={['foo', 'bar', 'baz']}>
                <WizardStep name="foo" />

                <WizardStep name="bar" />

                <WizardStep name="baz" />

                <WizardProgress {...props}>
                    {(activeStepIndex, totalSteps) =>
                        `${activeStepIndex} out of ${totalSteps}`
                    }
                </WizardProgress>
            </Wizard>
        )
    },
}

export const Default = {
    ...Template,
}

export default storyConfig
