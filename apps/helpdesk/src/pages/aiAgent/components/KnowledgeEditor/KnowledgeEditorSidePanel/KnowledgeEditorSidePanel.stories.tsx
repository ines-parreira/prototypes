import React, { ComponentProps } from 'react'

import { Meta, StoryFn, StoryObj } from '@storybook/react'

import { KnowledgeEditorSidePanel } from './KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleDetails } from './KnowledgeEditorSidePanelHelpCenterArticle/KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement } from './KnowledgeEditorSidePanelHelpCenterArticle/KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleImpact } from './KnowledgeEditorSidePanelHelpCenterArticle/KnowledgeEditorSidePanelSectionHelpCenterArticleImpact'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleRelatedTickets } from './KnowledgeEditorSidePanelHelpCenterArticle/KnowledgeEditorSidePanelSectionHelpCenterArticleRelatedTickets'

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
    <div
        style={{
            border: '1px solid var(--border-neutral-default)',
            borderLeft: 'none',
            borderBottom: 'none',
            display: 'flex',
            justifyContent: 'flex-end',
        }}
    >
        <KnowledgeEditorSidePanel {...args} />
    </div>
)

const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

export const ForHelpCenterArticle: Story = Template.bind({})
ForHelpCenterArticle.args = {
    initialExpandedSections: [
        'details',
        'impact',
        'related-tickets',
        'engagement',
        'settings',
    ],
    children: (
        <>
            <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails
                isPublished={true}
                createdDatetime={new Date('2025-06-17')}
                lastUpdatedDatetime={new Date('2025-06-17')}
                articleUrl="https://caitlynminimalist.com/products/duo-baguette-birthstone-ring"
                articleId="12345"
                sectionId="details"
            />
            <KnowledgeEditorSidePanelSectionHelpCenterArticleImpact
                successRate={0.28}
                csat={3.2}
                gmvInfluenced={{ value: 1200, currency: 'USD' }}
                sectionId="impact"
            />
            <KnowledgeEditorSidePanelSectionHelpCenterArticleRelatedTickets
                tickets={[
                    {
                        title: 'Still waiting on my order?',
                        content:
                            'I have a problem with my order, it arrived broken and doesn’t turn on.',
                        lastUpdatedDatetime: oneHourAgo,
                    },
                    {
                        title: 'Still waiting on my order?',
                        content:
                            'I have a problem with my order, it arrived broken and doesn’t turn on.',
                        lastUpdatedDatetime: oneHourAgo,
                    },
                    {
                        title: 'Still waiting on my order?',
                        content:
                            'I have a problem with my order, it arrived broken and doesn’t turn on.',
                        lastUpdatedDatetime: oneHourAgo,
                    },
                    {
                        title: 'Still waiting on my order?',
                        content:
                            'I have a problem with my order, it arrived broken and doesn’t turn on.',
                        lastUpdatedDatetime: oneHourAgo,
                    },
                ]}
                relatedTicketsUrl="https://gorgias.gorgias.com/app/views"
                sectionId="related-tickets"
            />
            <KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement
                views={1208}
                rating={0.58}
                reactions={{ positive: 871, negative: 635 }}
                sectionId="engagement"
                reportUrl="https://gorgias.gorgias.com/app/views"
            />
        </>
    ),
}

export const ForHelpCenterNewArticle: Story = Template.bind({})
ForHelpCenterNewArticle.args = {
    initialExpandedSections: [
        'details',
        'impact',
        'related-tickets',
        'engagement',
        'settings',
    ],
    children: (
        <>
            <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails sectionId="details" />
            <KnowledgeEditorSidePanelSectionHelpCenterArticleImpact sectionId="impact" />
            <KnowledgeEditorSidePanelSectionHelpCenterArticleRelatedTickets sectionId="related-tickets" />
            <KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement sectionId="engagement" />
        </>
    ),
}
