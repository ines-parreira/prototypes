import React, { ComponentProps, useState } from 'react'

import { Meta, StoryFn, StoryObj } from '@storybook/react'

import { KnowledgeEditorTopBar } from './KnowledgeEditorTopBar'
import { KnowledgeEditorTopBarGuidanceControls } from './KnowledgeEditorTopBarGuidanceControls'
import {
    ArticleModes,
    KnowledgeEditorTopBarHelpCenterArticlesControls,
} from './KnowledgeEditorTopBarHelpCenterArticlesControls'
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

export const ForGuidanceRead: Story = Template.bind({})
ForGuidanceRead.args = {
    onClickPrevious: () => {},
    onClickNext: () => {},
    title: 'Guidance',
    children: (
        <KnowledgeEditorTopBarGuidanceControls
            disabled={false}
            mode="read"
            onCopy={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
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
            disabled={false}
            mode="edit"
            onSave={undefined}
            onCancel={() => {}}
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
            disabled={false}
            mode="create"
            onCancel={() => {}}
            onCreate={() => {}}
        />
    ),
}

export const ForHelpCenterArticleRead: Story = Template.bind({})
ForHelpCenterArticleRead.args = {
    title: 'Some help center article',
    children: (
        <KnowledgeEditorTopBarHelpCenterArticlesControls
            mode={ArticleModes.READ}
            onEdit={() => {}}
            onDelete={() => {}}
            onTest={() => {}}
            disabled={false}
        />
    ),
}

export const ForHelpCenterArticleEditDraft: Story = Template.bind({})
ForHelpCenterArticleEditDraft.args = {
    title: 'Some help center article',
    onChangeTitle: () => {},
    children: (
        <KnowledgeEditorTopBarHelpCenterArticlesControls
            mode={ArticleModes.EDIT_DRAFT}
            onCancel={() => {}}
            onSaveDraft={() => {}}
            onSaveAndPublish={() => {}}
            disabled={false}
        />
    ),
}

export const ForHelpCenterArticleEditPublished: Story = Template.bind({})
ForHelpCenterArticleEditPublished.args = {
    title: 'Some help center article',
    onChangeTitle: () => {},
    children: (
        <KnowledgeEditorTopBarHelpCenterArticlesControls
            mode={ArticleModes.EDIT_PUBLISHED}
            onCancel={() => {}}
            onSaveAndPublish={() => {}}
            disabled={false}
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
            mode={ArticleModes.EDIT_DRAFT}
            onCancel={() => {}}
            onSaveDraft={undefined}
            onSaveAndPublish={undefined}
            disabled={false}
        />
    ),
}

export const ForSnippet: Story = Template.bind({})
ForSnippet.args = {
    onClickPrevious: () => {},
    onClickNext: () => {},
    title: 'Document snippet',
    children: <KnowledgeEditorTopBarSnippetControls onTest={() => {}} />,
}
