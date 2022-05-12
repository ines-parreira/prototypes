import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'

import Spinner from './Spinner'

const storyConfig: Meta = {
    title: 'Feedback/Spinner',
    component: Spinner,
    parameters: {
        docs: {
            description: {
                component: 'A simple spinner',
            },
        },
        backgrounds: {default: 'grey'},
    },
    argTypes: {
        color: {
            control: {
                type: 'select',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof Spinner>> = (props) => (
    <Spinner {...props} width="40px" />
)

const templateParameters = {
    controls: {
        include: ['color'],
    },
}

const defaultProps: ComponentProps<typeof Spinner> = {
    color: 'light',
}
export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig
