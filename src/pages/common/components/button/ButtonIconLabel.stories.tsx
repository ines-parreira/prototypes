import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import Button from './Button'
import ButtonIconLabel from './ButtonIconLabel'

const storyConfig: Meta = {
    title: 'General/Button/ButtonIconLabel',
    component: ButtonIconLabel,
    argTypes: {
        position: {
            control: {
                type: 'select',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof ButtonIconLabel>> = (props) => (
    <ButtonIconLabel {...props} />
)

const UsageTemplate: Story<ComponentProps<typeof ButtonIconLabel>> = (
    props
) => (
    <Button>
        <ButtonIconLabel {...props} />
    </Button>
)

const defaultProps: ComponentProps<typeof ButtonIconLabel> = {
    children: 'Click me!',
    icon: 'calendar_today',
    position: 'left',
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = {
    controls: {
        exclude: ['className'],
    },
}

export const Usage = UsageTemplate.bind({})
Usage.args = defaultProps
Usage.parameters = {
    controls: {
        exclude: ['className'],
    },
}

export default storyConfig
