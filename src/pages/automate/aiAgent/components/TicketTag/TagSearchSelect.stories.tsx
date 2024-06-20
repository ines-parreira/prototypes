import React from 'react'
import {Meta, StoryObj} from '@storybook/react'
import TagSearchSelect from './TagSearchSelect'

const meta: Meta<typeof TagSearchSelect> = {
    title: 'AI Agent/Configuration/Tags/TagSearchSelect',
    component: TagSearchSelect,
    argTypes: {
        onSelect: {
            description: 'What to do when tag is selected',
        },
        defaultTag: {
            description: 'Default selected tag name',
            default: undefined,
        },
    },
}

export default meta

type Story = StoryObj<typeof TagSearchSelect>

export const NoSelectedTag: Story = {
    render: (args) => <TagSearchSelect {...args} />,
    args: {
        onSelect: () => {},
    },
}

export const SelectedTag: Story = {
    render: (args) => <TagSearchSelect {...args} />,
    args: {
        onSelect: () => {},
        defaultTag: 'defaul-tag-name',
    },
}
