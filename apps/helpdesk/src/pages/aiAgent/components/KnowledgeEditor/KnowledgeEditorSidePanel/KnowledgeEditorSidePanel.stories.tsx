import type { ComponentProps } from 'react'

import { history } from '@repo/routing'
import type { Meta, StoryFn, StoryObj } from '@storybook/react'
import { Map } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router'
import configureMockStore from 'redux-mock-store'

import { AI_AGENT_OUTCOME_DISPLAY_LABELS } from 'domains/reporting/hooks/automate/types'
import { KnowledgeEditorSidePanelGuidance } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/KnowledgeEditorSidePanelGuidance'
import { KnowledgeEditorSidePanelURLSnippet } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSnippet/KnowledgeEditorSidePanelURLSnippet'

import { KnowledgeEditorSidePanel } from './KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelDocumentSnippet } from './KnowledgeEditorSidePanelSnippet/KnowledgeEditorSidePanelDocumentSnippet'
import { KnowledgeEditorSidePanelStoreSnippet } from './KnowledgeEditorSidePanelSnippet/KnowledgeEditorSidePanelStoreSnippet'

const mockStore = configureMockStore()
const defaultState = {
    currentUser: Map({
        id: Date.now(),
        preferences: Map({
            timezone: 'America/New_York',
            date_format: 'MM/DD/YYYY',
            time_format: 'h:mm A',
        }),
    }),
}

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
    <Provider store={mockStore(defaultState)}>
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
    </Provider>
)

const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

const relatedTickets = {
    ticketCount: 4,
    latest3Tickets: [
        {
            id: 123,
            title: 'Still waiting on my order?',
            lastUpdatedDatetime: oneHourAgo,
            messageCount: 2,
            aiAgentOutcome: AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
        },
        {
            id: 456,
            title: 'How to cancel my order?',
            lastUpdatedDatetime: oneHourAgo,
            messageCount: 3,
            aiAgentOutcome: AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover,
        },
        {
            id: 789,
            title: 'How to track my order?',
            lastUpdatedDatetime: oneHourAgo,
            messageCount: 1,
            aiAgentOutcome: AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover,
        },
    ],
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
                tickets: { value: 42 },
                handoverTickets: { value: 5 },
                csat: { value: 4.2 },
                intents: ['Order/status', 'Shipping/inquiry'],
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
            relatedTickets={{ ticketCount: 0 }}
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
                googleStorageUrl: 'https://storage.googleapis.com/doc.pdf',
            }}
            impact={{
                tickets: { value: 42 },
                handoverTickets: { value: 5 },
                csat: { value: 4.2 },
                intents: ['Order/status', 'Shipping/inquiry'],
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
                googleStorageUrl: 'https://storage.googleapis.com/doc.pdf',
            }}
            impact={{}}
            relatedTickets={{ ticketCount: 0 }}
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
                tickets: { value: 42 },
                handoverTickets: { value: 5 },
                csat: { value: 4.2 },
                intents: ['Order/status', 'Shipping/inquiry'],
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
            relatedTickets={{ ticketCount: 0 }}
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
                tickets: { value: 42 },
                handoverTickets: { value: 5 },
                csat: { value: 4.2 },
                intents: ['Order/status', 'Shipping/inquiry'],
            }}
            relatedTickets={relatedTickets}
        />
    ),
}
