import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

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
}

export default storyConfig
