import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import Wizard from './Wizard'
import WizardStep from './WizardStep'

const storyConfig: Meta = {
    title: 'General/Wizard container/WizardStep',
    component: WizardStep,
}

const Template: Story<ComponentProps<typeof WizardStep>> = (props) => (
    <Wizard startAt="foo" steps={['foo', 'bar']}>
        <WizardStep {...props}>The current step is "{props.name}"</WizardStep>
    </Wizard>
)

export const Default = Template.bind({})
Default.args = {
    name: 'foo',
}

export default storyConfig
