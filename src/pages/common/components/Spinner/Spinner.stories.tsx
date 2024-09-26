import {Meta, StoryFn} from '@storybook/react'
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
        size: {
            control: {
                type: 'select',
            },
        },
    },
}

const Template: StoryFn<ComponentProps<typeof Spinner>> = (props) => (
    <Spinner {...props} />
)

const templateParameters = {
    controls: {
        include: ['color', 'size', 'width'],
    },
}

const defaultProps: ComponentProps<typeof Spinner> = {
    color: 'gloom',
    width: '40px',
}
export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig
