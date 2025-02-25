import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import { QuickFilters } from './QuickFilters'

const storyConfig: Meta = {
    title: 'Convert/QuickFilters',
    component: QuickFilters,
}

const Template: Story<ComponentProps<typeof QuickFilters>> = (props) => (
    <QuickFilters {...props} />
)

export const Default = Template.bind({})
Default.args = {
    defaultActiveFilters: [],
    filters: [
        {
            id: '1',
            label: 'Contains product cards',
        },
        {
            id: '2',
            label: 'Contains discount codes',
        },
        {
            id: '3',
            label: 'Triggered on exit intent',
        },
        {
            id: '4',
            label: 'Triggered outside business hours',
        },
    ],
}

export default storyConfig
