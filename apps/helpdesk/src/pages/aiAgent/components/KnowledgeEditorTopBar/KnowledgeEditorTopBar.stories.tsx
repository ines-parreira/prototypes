import React, { ComponentProps } from 'react'

import { Meta, StoryFn, StoryObj } from '@storybook/react'

import { KnowledgeEditorTopBar } from './KnowledgeEditorTopBar'
import { KnowledgeEditorTopBarGuidanceControls } from './KnowledgeEditorTopBarGuidanceControls'

const meta: Meta<typeof KnowledgeEditorTopBar> = {
    title: 'AI Agent/Knowledge/KnowledgeEditorTopBar',
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
) => (
    <div
        style={{
            border: '1px solid var(--border-neutral-default)',
            borderBottom: 'none',
            borderRadius: '12px 12px 0 0',
        }}
    >
        <KnowledgeEditorTopBar {...args} />
    </div>
)

export const ForGuidanceReadOnly: Story = Template.bind({})
ForGuidanceReadOnly.args = {
    onClickPrevious: () => {},
    onClickNext: () => {},
    title: 'Guidance',
    children: (
        <KnowledgeEditorTopBarGuidanceControls
            mode={{
                mode: 'readonly',
                onEdit: () => {},
                onDelete: () => {},
            }}
        />
    ),
}
export const ForGuidanceEdit: Story = Template.bind({})
ForGuidanceEdit.args = {
    onClickPrevious: () => {},
    onClickNext: () => {},
    title: 'Guidance',
    children: (
        <KnowledgeEditorTopBarGuidanceControls
            mode={{
                mode: 'edit',
                onSave: undefined,
                onCancel: () => {},
            }}
        />
    ),
}
export const ForGuidanceCreate: Story = Template.bind({})
ForGuidanceCreate.args = {
    onClickPrevious: () => {},
    onClickNext: () => {},
    title: 'Guidance',
    children: (
        <KnowledgeEditorTopBarGuidanceControls
            mode={{
                mode: 'create',
                onCancel: () => {},
                onCreate: () => {},
            }}
        />
    ),
}

export const ForKnowledgeWithEditableTitle: Story = Template.bind({})
ForKnowledgeWithEditableTitle.args = {
    title: 'Some help center article',
    onChangeTitle: () => {},
}
