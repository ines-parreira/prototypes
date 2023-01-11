import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'

import Skeleton from './Skeleton'

const storyConfig: Meta = {
    title: 'General/Skeleton',
    component: Skeleton,
    argTypes: {
        count: {
            control: {
                type: 'number',
            },
        },
        height: {
            control: {
                type: 'number',
            },
        },
        width: {
            control: {
                type: 'number',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof Skeleton>> = (props) => (
    <Skeleton {...props} />
)

const templateParameters = {
    controls: {
        include: ['count', 'height', 'width'],
    },
}

const defaultProps: ComponentProps<typeof Skeleton> = {
    count: 5,
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig
