import React, { ComponentProps } from 'react'

import { Meta, StoryFn, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { KnowledgeHubHeader } from './KnowledgeHubHeader'

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
        shopName: { control: 'text' },
        data: { control: 'object' },
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
    shopName: 'my-store',
    onTest: () => {},
    onAddKnowledge: () => {},
}
DefaultListView.storyName = 'List View (data: null)'

export const StoreWebsite: Story = Template.bind({})
StoreWebsite.args = {
    shopName: 'my-store',
    data: {
        type: 'store-website',
        name: 'My Shopify Store',
        lastSyncedDate: '2025-01-15T10:30:00Z',
        id: 'store-123',
    },
    onSync: () => {},
}
StoreWebsite.storyName = 'Type: Store Website'

export const StoreWebsiteDisabled: Story = Template.bind({})
StoreWebsiteDisabled.args = {
    shopName: 'my-store',
    data: {
        type: 'store-website',
        name: 'My Shopify Store',
        lastSyncedDate: '2025-01-15T10:30:00Z',
        id: 'store-123',
    },
    onSync: () => {},
    isSyncButtonDisabled: true,
}
StoreWebsiteDisabled.storyName = 'Type: Store Website (Disabled)'

export const URLs: Story = Template.bind({})
URLs.args = {
    shopName: 'my-store',
    data: {
        type: 'urls',
        name: 'https://example.com/documentation',
        lastSyncedDate: '2025-01-20T14:45:00Z',
        id: 'url-456',
    },
    onSync: () => {},
    onDelete: () => {},
}
URLs.storyName = 'Type: URLs'

export const URLsDisabled: Story = Template.bind({})
URLsDisabled.args = {
    shopName: 'my-store',
    data: {
        type: 'urls',
        name: 'https://example.com/documentation',
        lastSyncedDate: '2025-01-20T14:45:00Z',
        id: 'url-456',
    },
    onSync: () => {},
    onDelete: () => {},
    isSyncButtonDisabled: true,
    isDeleteButtonDisabled: true,
}
URLsDisabled.storyName = 'Type: URLs (All Disabled)'

export const URLsSyncDisabled: Story = Template.bind({})
URLsSyncDisabled.args = {
    shopName: 'my-store',
    data: {
        type: 'urls',
        name: 'https://example.com/documentation',
        lastSyncedDate: '2025-01-20T14:45:00Z',
        id: 'url-456',
    },
    onSync: () => {},
    onDelete: () => {},
    isSyncButtonDisabled: true,
}
URLsSyncDisabled.storyName = 'Type: URLs (Sync Disabled)'

export const URLsLongURL: Story = Template.bind({})
URLsLongURL.args = {
    shopName: 'my-store',
    data: {
        type: 'urls',
        name: 'https://very-long-domain-name.example.com/path/to/documentation/with/many/segments',
        lastSyncedDate: '2025-01-20T14:45:00Z',
        id: 'url-789',
    },
    onSync: () => {},
    onDelete: () => {},
}
URLsLongURL.storyName = 'Type: URLs (Long URL)'

export const Documents: Story = Template.bind({})
Documents.args = {
    shopName: 'my-store',
    data: {
        type: 'documents',
        name: 'Product Manual.pdf',
        id: 'doc-789',
    },
    onDelete: () => {},
}
Documents.storyName = 'Type: Documents'

export const DocumentsDisabled: Story = Template.bind({})
DocumentsDisabled.args = {
    shopName: 'my-store',
    data: {
        type: 'documents',
        name: 'Product Manual.pdf',
        id: 'doc-789',
    },
    onDelete: () => {},
    isDeleteButtonDisabled: true,
}
DocumentsDisabled.storyName = 'Type: Documents (Disabled)'
