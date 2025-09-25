import React, { ComponentProps, useState } from 'react'

import { Meta, StoryFn, StoryObj } from '@storybook/react'

import { KnowledgeEditorTopBar } from './KnowledgeEditorTopBar'
import { KnowledgeEditorTopBarGuidanceControls } from './KnowledgeEditorTopBarGuidanceControls'
import { KnowledgeEditorTopBarHelpCenterArticlesControls } from './KnowledgeEditorTopBarHelpCenterArticlesControls'
import { KnowledgeEditorTopBarSnippetControls } from './KnowledgeEditorTopBarSnippetControls'

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

export const ForGuidanceRead: Story = Template.bind({})
ForGuidanceRead.args = {
    onClickPrevious: () => {},
    onClickNext: () => {},
    title: 'Guidance',
    children: (
        <KnowledgeEditorTopBarGuidanceControls
            mode={{
                mode: 'read',
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

export const ForHelpCenterArticleRead: Story = Template.bind({})
ForHelpCenterArticleRead.args = {
    title: 'Some help center article',
    children: (
        <KnowledgeEditorTopBarHelpCenterArticlesControls
            mode={{
                mode: 'read',
                onEdit: () => {},
                onDelete: () => {},
            }}
        />
    ),
}

export const ForHelpCenterArticleEditDraft: Story = Template.bind({})
ForHelpCenterArticleEditDraft.args = {
    title: 'Some help center article',
    onChangeTitle: () => {},
    children: (
        <KnowledgeEditorTopBarHelpCenterArticlesControls
            mode={{
                mode: 'editDraft',
                onCancel: () => {},
                onSaveDraft: () => {},
                onSaveAndPublish: () => {},
            }}
        />
    ),
}

export const ForHelpCenterArticleEditPublished: Story = Template.bind({})
ForHelpCenterArticleEditPublished.args = {
    title: 'Some help center article',
    onChangeTitle: () => {},
    children: (
        <KnowledgeEditorTopBarHelpCenterArticlesControls
            mode={{
                mode: 'editPublished',
                onCancel: () => {},
                onSaveAndPublish: () => {},
            }}
        />
    ),
}

export const ForHelpCenterArticleEditDraftWithDisabledButtons: Story =
    Template.bind({})
ForHelpCenterArticleEditDraftWithDisabledButtons.args = {
    title: 'Some help center article',
    onChangeTitle: () => {},
    children: (
        <KnowledgeEditorTopBarHelpCenterArticlesControls
            mode={{
                mode: 'editDraft',
                onCancel: () => {},
                onSaveDraft: undefined,
                onSaveAndPublish: undefined,
            }}
        />
    ),
}

export const ForSnippet: Story = Template.bind({})
ForSnippet.args = {
    onClickPrevious: () => {},
    onClickNext: () => {},
    title: 'Document snippet',
    children: <KnowledgeEditorTopBarSnippetControls />,
}
