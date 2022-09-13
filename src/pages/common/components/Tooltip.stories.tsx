import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import Tooltip from './Tooltip'

const storyConfig: Meta = {
    title: 'General/Tooltip',
    component: Tooltip,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        caption: {
            control: {
                type: 'text',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof Tooltip>> = (props) => {
    const id = 'tooltip-story-id'
    return (
        <>
            <button id={id}>Show tooltip</button>
            <Tooltip {...props} target={id}>
                {props.children}
            </Tooltip>
        </>
    )
}

const templateParameters = {
    controls: {
        include: ['children', 'placement'],
    },
}

const defaultProps: Partial<ComponentProps<typeof Tooltip>> = {
    children: 'This is a Tooltip',
    placement: 'top',
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig
