import React, { ComponentProps } from 'react'

import { Meta, StoryFn, StoryObj } from '@storybook/react'
import { Router } from 'react-router'

import { KnowledgeEditorSidePanelGuidance } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/KnowledgeEditorSidePanelGuidance'
import { KnowledgeEditorSidePanelHelpCenterArticle } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelHelpCenterArticle/KnowledgeEditorSidePanelHelpCenterArticle'
import { KnowledgeEditorSidePanelURLSnippet } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSnippet/KnowledgeEditorSidePanelURLSnippet'
import history from 'pages/history'

import { KnowledgeEditorSidePanel } from './KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelDocumentSnippet } from './KnowledgeEditorSidePanelSnippet/KnowledgeEditorSidePanelDocumentSnippet'
import { KnowledgeEditorSidePanelStoreSnippet } from './KnowledgeEditorSidePanelSnippet/KnowledgeEditorSidePanelStoreSnippet'

const meta: Meta<typeof KnowledgeEditorSidePanel> = {
    title: 'AI Agent/Knowledge/KnowledgeEditor/KnowledgeEditorSidePanel',
    component: KnowledgeEditorSidePanel,
    argTypes: {},
}

export default meta

type Story = StoryObj<typeof KnowledgeEditorSidePanel>

const Template: StoryFn<ComponentProps<typeof KnowledgeEditorSidePanel>> = (
    args,
) => (
    <Router history={history}>
        <div
            style={{
                border: '1px solid var(--border-neutral-default)',
                borderLeft: 'none',
                borderBottom: 'none',
                display: 'flex',
                justifyContent: 'flex-end',
            }}
        >
            {args.children}
        </div>
    </Router>
)

const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

const relatedTickets = {
    tickets: [
        {
            title: 'Still waiting on my order?',
            content:
                'I have a problem with my order, it arrived broken and doesn’t turn on.',
            lastUpdatedDatetime: oneHourAgo,
            url: 'https://gorgias.gorgias.com/app/views/123/456',
        },
        {
            title: 'Still waiting on my order?',
            content:
                'I have a problem with my order, it arrived broken and doesn’t turn on.',
            lastUpdatedDatetime: oneHourAgo,
            url: 'https://gorgias.gorgias.com/app/views/123/456',
        },
        {
            title: 'Still waiting on my order?',
            content:
                'I have a problem with my order, it arrived broken and doesn’t turn on.',
            lastUpdatedDatetime: oneHourAgo,
            url: 'https://gorgias.gorgias.com/app/views/123/456',
        },
        {
            title: 'Still waiting on my order?',
            content:
                'I have a problem with my order, it arrived broken and doesn’t turn on.',
            lastUpdatedDatetime: oneHourAgo,
            url: 'https://gorgias.gorgias.com/app/views/123/456',
        },
    ],
    relatedTicketsUrl: 'https://gorgias.gorgias.com/app/views',
}

export const ForHelpCenterArticle: Story = Template.bind({})
ForHelpCenterArticle.args = {
    initialExpandedSections: [
        'details',
        'impact',
        'related-tickets',
        'engagement',
    ],
    children: (
        <KnowledgeEditorSidePanelHelpCenterArticle
            details={{
                isPublished: true,
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                articleUrl:
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
            }}
            impact={{
                successRate: 0.28,
                csat: 3.2,
                gmvInfluenced: { value: 1200, currency: 'USD' },
            }}
            relatedTickets={relatedTickets}
            engagement={{
                views: 1208,
                rating: 0.58,
                reactions: { positive: 871, negative: 635 },
                reportUrl: 'https://gorgias.gorgias.com/app/views',
            }}
        />
    ),
}

export const ForHelpCenterNewArticle: Story = Template.bind({})
ForHelpCenterNewArticle.args = {
    initialExpandedSections: [
        'details',
        'impact',
        'related-tickets',
        'engagement',
    ],
    children: (
        <KnowledgeEditorSidePanelHelpCenterArticle
            details={{}}
            impact={{}}
            relatedTickets={{}}
            engagement={{}}
        />
    ),
}

export const ForGuidance: Story = Template.bind({})
ForGuidance.args = {
    initialExpandedSections: ['details', 'impact', 'related-tickets'],
    children: (
        <KnowledgeEditorSidePanelGuidance
            details={{
                aiAgentStatus: { value: true, onChange: () => {} },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                isUpdating: false,
            }}
            impact={{
                successRate: 0.28,
                csat: 3.2,
                gmvInfluenced: { value: 1200, currency: 'USD' },
            }}
            relatedTickets={relatedTickets}
        />
    ),
}

export const ForNewGuidance: Story = Template.bind({})
ForNewGuidance.args = {
    initialExpandedSections: ['details', 'impact', 'related-tickets'],
    children: (
        <KnowledgeEditorSidePanelGuidance
            details={{
                aiAgentStatus: { value: true, onChange: () => {} },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                isUpdating: false,
            }}
            impact={{}}
            relatedTickets={{}}
        />
    ),
}

export const ForDocumentSnippet: Story = Template.bind({})
ForDocumentSnippet.args = {
    initialExpandedSections: ['details', 'impact', 'related-tickets'],
    children: (
        <KnowledgeEditorSidePanelDocumentSnippet
            details={{
                aiAgentStatus: { value: true, onChange: () => {} },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                sourceDocument: 'https://some-doc/doc.pdf',
            }}
            impact={{
                successRate: 0.28,
                csat: 3.2,
                gmvInfluenced: { value: 1200, currency: 'USD' },
            }}
            relatedTickets={relatedTickets}
        />
    ),
}

export const ForNewDocumentSnippet: Story = Template.bind({})
ForNewDocumentSnippet.args = {
    initialExpandedSections: ['details', 'impact', 'related-tickets'],
    children: (
        <KnowledgeEditorSidePanelDocumentSnippet
            details={{
                aiAgentStatus: { value: true, onChange: () => {} },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                sourceDocument: 'https://some-doc/doc.pdf',
            }}
            impact={{}}
            relatedTickets={{}}
        />
    ),
}

export const ForURLSnippet: Story = Template.bind({})
ForURLSnippet.args = {
    initialExpandedSections: ['details', 'impact', 'related-tickets'],
    children: (
        <KnowledgeEditorSidePanelURLSnippet
            details={{
                aiAgentStatus: { value: true, onChange: () => {} },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                url: 'https://www.google.com',
            }}
            impact={{
                successRate: 0.28,
                csat: 3.2,
                gmvInfluenced: { value: 1200, currency: 'USD' },
            }}
            relatedTickets={relatedTickets}
        />
    ),
}

export const ForNewURLSnippet: Story = Template.bind({})
ForNewURLSnippet.args = {
    initialExpandedSections: ['details', 'impact', 'related-tickets'],
    children: (
        <KnowledgeEditorSidePanelURLSnippet
            details={{
                aiAgentStatus: { value: true, onChange: () => {} },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                url: 'https://www.google.com',
            }}
            impact={{}}
            relatedTickets={{}}
        />
    ),
}

export const ForStoreSnippet: Story = Template.bind({})
ForStoreSnippet.args = {
    initialExpandedSections: ['details', 'impact', 'related-tickets'],
    children: (
        <KnowledgeEditorSidePanelStoreSnippet
            details={{
                aiAgentStatus: { value: true, onChange: () => {} },
                createdDatetime: new Date('2025-06-17'),
                lastUpdatedDatetime: new Date('2025-06-17'),
                urls: [
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                    'https://caitlynminimalist.com/products/duo-baguette-birthstone-ring',
                ],
            }}
            impact={{
                successRate: 0.28,
                csat: 3.2,
                gmvInfluenced: { value: 1200, currency: 'USD' },
            }}
            relatedTickets={relatedTickets}
        />
    ),
}
