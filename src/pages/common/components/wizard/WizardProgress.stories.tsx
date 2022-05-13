import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import Wizard from './Wizard'
import WizardStep from './WizardStep'
import WizardProgress from './WizardProgress'

const storyConfig: Meta = {
    title: 'General/Wizard container/WizardProgress',
    component: WizardProgress,
}

const Template: Story<ComponentProps<typeof WizardProgress>> = (props) => {
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
}

export const Default = Template.bind({})

export default storyConfig
