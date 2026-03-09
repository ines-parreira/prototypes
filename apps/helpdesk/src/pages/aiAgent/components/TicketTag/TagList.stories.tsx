import React, { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import TagList from './TagList'

const meta: Meta<typeof TagList> = {
    title: 'AI Agent/Configuration/Tags',
    component: TagList,
    argTypes: {
        tags: {
            description: 'List of already stored tags',
        },
    },
}

export default meta

type Story = StoryObj<typeof TagList>

const WrapperComponent = () => {
    const [tags, setTags] = useState([
        {
            name: 'ticket_created',
            description: 'Handle it this way',
        },
        {
            name: 'ticket_updated',
            description: 'Handle it that way',
        },
        {
            name: '',
            description: '',
        },
    ])
    return <TagList tags={tags} onTagsUpdate={setTags} />
}

export const Default: Story = {
    render: () => <WrapperComponent />,
}
