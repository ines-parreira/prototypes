import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import Wizard from './Wizard'
import WizardStep from './WizardStep'

const storyConfig: Meta = {
    title: 'General/Wizard container/WizardStep',
    component: WizardStep,
}

type TemplateProps = ComponentProps<typeof WizardStep>

const Template: StoryObj<TemplateProps> = {
    render: function Template({ ...props }) {
        return (
            <Wizard startAt="foo" steps={['foo', 'bar']}>
                <WizardStep {...props}>
                    {`The current step is "${props.name}"`}
                </WizardStep>
            </Wizard>
        )
    },
}

export const Default = {
    ...Template,
    args: {
        name: 'foo',
    },
}

export default storyConfig
