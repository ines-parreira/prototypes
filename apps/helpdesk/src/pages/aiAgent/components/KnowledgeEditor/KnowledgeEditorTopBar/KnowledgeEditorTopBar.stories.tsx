import type { ComponentProps } from 'react'
import React, { useState } from 'react'

import type { Meta, StoryFn, StoryObj } from 'storybook-react-rsbuild'

import { KnowledgeEditorTopBar } from './KnowledgeEditorTopBar'
import { KnowledgeEditorTopBarSnippetControls } from './KnowledgeEditorTopBarSnippetControls'

const meta: Meta<typeof KnowledgeEditorTopBar> = {
    title: 'AI Agent/Knowledge/KnowledgeEditor/KnowledgeEditorTopBar',
    component: KnowledgeEditorTopBar,
    argTypes: {
        onClickPrevious: { control: 'object' },
        onClickNext: { control: 'object' },
        title: { control: 'text' },
        onChangeTitle: { control: 'object' },
        isFullscreen: { control: 'boolean' },
        onToggleFullscreen: { control: 'object' },
        onClose: { control: 'object' },
        isDetailsView: { control: 'boolean' },
        onToggleDetailsView: { control: 'object' },
    },
}

export default meta

type Story = StoryObj<typeof KnowledgeEditorTopBar>

const Template: StoryFn<ComponentProps<typeof KnowledgeEditorTopBar>> = (
    args,
) => {
    const [title, setTitle] = useState(args.title)
    return (
        <div
            style={{
                border: '1px solid var(--border-neutral-default)',
                borderBottom: 'none',
                borderRadius: '12px 12px 0 0',
            }}
        >
            <KnowledgeEditorTopBar
                {...args}
                title={title}
                onChangeTitle={args.onChangeTitle ? setTitle : undefined}
            />
        </div>
    )
}

export const ForSnippet: Story = Template.bind({})
ForSnippet.args = {
    onClickPrevious: () => {},
    onClickNext: () => {},
    title: 'Document snippet',
    children: <KnowledgeEditorTopBarSnippetControls onTest={() => {}} />,
}
