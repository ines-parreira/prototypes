import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import Card from './Card'

const storyConfig: Meta = {
    title: 'Stats/Card',
    component: Card,
}

const Template: Story<ComponentProps<typeof Card>> = (props) => (
    <Card {...props} />
)

const defaultProps: ComponentProps<typeof Card> = {
    className: '',
    children: 'Card content',
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
