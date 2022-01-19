import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import RadioButton from './RadioButton'

const storyConfig: Meta = {
    title: 'Data Entry/RadioButton',
    component: RadioButton,
}

const Template: Story<ComponentProps<typeof RadioButton>> = (props) => (
    <RadioButton {...props} />
)

const templateParameters = {
    controls: {
        include: ['caption', 'label', 'isDisabled', 'isSelected'],
    },
}

const defaultProps: Partial<ComponentProps<typeof RadioButton>> = {
    label: 'I am a potato',
    value: 'potato',
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig
