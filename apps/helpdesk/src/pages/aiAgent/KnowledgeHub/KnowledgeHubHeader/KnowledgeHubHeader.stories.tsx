import type { ComponentProps } from 'react'
import React from 'react'

import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryFn, StoryObj } from 'storybook-react-rsbuild'

import { KnowledgeHubHeader } from 'pages/aiAgent/KnowledgeHub/KnowledgeHubHeader/KnowledgeHubHeader'
import { KnowledgeType } from 'pages/aiAgent/KnowledgeHub/types'

const meta: Meta<typeof KnowledgeHubHeader> = {
    title: 'AI Agent/Knowledge Hub/KnowledgeHubHeader',
    component: KnowledgeHubHeader,
    decorators: [
        (Story) => (
            <MemoryRouter>
                <Story />
            </MemoryRouter>
        ),
    ],
    argTypes: {
        data: { control: 'object' },
        onBack: { action: 'onBack' },
        onAddKnowledge: { action: 'onAddKnowledge' },
        onTest: { action: 'onTest' },
        onSync: { action: 'onSync' },
        onDelete: { action: 'onDelete' },
        isTestButtonDisabled: { control: 'boolean' },
        isAddKnowledgeButtonDisabled: { control: 'boolean' },
        isSyncButtonDisabled: { control: 'boolean' },
        isDeleteButtonDisabled: { control: 'boolean' },
    },
}

export default meta

type Story = StoryObj<typeof KnowledgeHubHeader>

const Template: StoryFn<ComponentProps<typeof KnowledgeHubHeader>> = (args) => {
    return (
        <div
            style={{
                border: '1px solid var(--border-neutral-default)',
                borderRadius: '8px',
            }}
        >
            <KnowledgeHubHeader {...args} />
        </div>
    )
}

export const DefaultListView: Story = Template.bind({})
DefaultListView.args = {
    data: null,
    onBack: () => {},
    onTest: () => {},
    onAddKnowledge: () => {},
}
DefaultListView.storyName = 'List View (data: null)'

export const StoreWebsite: Story = Template.bind({})
StoreWebsite.args = {
    data: {
        type: KnowledgeType.Domain,
        title: 'My Shopify Store',
        lastUpdatedAt: '2025-01-15T10:30:00Z',
        id: 'store-123',
    },
    onBack: () => {},
    onSync: () => {},
}
StoreWebsite.storyName = 'Type: Store Website'

export const StoreWebsiteDisabled: Story = Template.bind({})
StoreWebsiteDisabled.args = {
    data: {
        type: KnowledgeType.Domain,
        title: 'My Shopify Store',
        lastUpdatedAt: '2025-01-15T10:30:00Z',
        id: 'store-123',
    },
    onBack: () => {},
    onSync: () => {},
    isSyncButtonDisabled: true,
}
StoreWebsiteDisabled.storyName = 'Type: Store Website (Disabled)'

export const URLs: Story = Template.bind({})
URLs.args = {
    data: {
        type: KnowledgeType.URL,
        title: 'https://example.com/documentation',
        lastUpdatedAt: '2025-01-20T14:45:00Z',
        id: 'url-456',
    },
    onBack: () => {},
    onSync: () => {},
    onDelete: () => {},
}
URLs.storyName = 'Type: URLs'

export const URLsDisabled: Story = Template.bind({})
URLsDisabled.args = {
    data: {
        type: KnowledgeType.URL,
        title: 'https://example.com/documentation',
        lastUpdatedAt: '2025-01-20T14:45:00Z',
        id: 'url-456',
    },
    onBack: () => {},
    onSync: () => {},
    onDelete: () => {},
    isSyncButtonDisabled: true,
    isDeleteButtonDisabled: true,
}
URLsDisabled.storyName = 'Type: URLs (All Disabled)'

export const URLsSyncDisabled: Story = Template.bind({})
URLsSyncDisabled.args = {
    data: {
        type: KnowledgeType.URL,
        title: 'https://example.com/documentation',
        lastUpdatedAt: '2025-01-20T14:45:00Z',
        id: 'url-456',
    },
    onBack: () => {},
    onSync: () => {},
    onDelete: () => {},
    isSyncButtonDisabled: true,
}
URLsSyncDisabled.storyName = 'Type: URLs (Sync Disabled)'

export const URLsLongURL: Story = Template.bind({})
URLsLongURL.args = {
    data: {
        type: KnowledgeType.URL,
        title: 'https://very-long-domain-name.example.com/path/to/documentation/with/many/segments',
        lastUpdatedAt: '2025-01-20T14:45:00Z',
        id: 'url-789',
    },
    onBack: () => {},
    onSync: () => {},
    onDelete: () => {},
}
URLsLongURL.storyName = 'Type: URLs (Long URL)'

export const Documents: Story = Template.bind({})
Documents.args = {
    data: {
        type: KnowledgeType.Document,
        title: 'Product Manual.pdf',
        lastUpdatedAt: '2025-01-20T14:45:00Z',
        id: 'doc-789',
    },
    onBack: () => {},
    onDelete: () => {},
}
Documents.storyName = 'Type: Documents'

export const DocumentsDisabled: Story = Template.bind({})
DocumentsDisabled.args = {
    data: {
        type: KnowledgeType.Document,
        title: 'Product Manual.pdf',
        lastUpdatedAt: '2025-01-20T14:45:00Z',
        id: 'doc-789',
    },
    onBack: () => {},
    onDelete: () => {},
    isDeleteButtonDisabled: true,
}
DocumentsDisabled.storyName = 'Type: Documents (Disabled)'
