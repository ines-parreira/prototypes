import React, { ComponentProps, useState } from 'react'

import { history } from '@repo/routing'
import { Meta, StoryFn, StoryObj } from '@storybook/react'
import { Map } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router'
import configureMockStore from 'redux-mock-store'

import { KnowledgeEditorSidePanelGuidance } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/KnowledgeEditorSidePanelGuidance'
import { KnowledgeEditorSidePanelHelpCenterArticle } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelHelpCenterArticle/KnowledgeEditorSidePanelHelpCenterArticle'
import { KnowledgeEditorSidePanelURLSnippet } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSnippet/KnowledgeEditorSidePanelURLSnippet'
import { FlagLanguageItem } from 'pages/common/components/LanguageBulletList/FlagLanguageItem'
import { OptionItem as LocaleOption } from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

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

const categoryOptions = [
    { label: '- No category -', value: 'null' },
    { label: 'Orders', value: 1 },
    { label: 'Pricing', value: 2 },
]

const categoryTitlesById = {
    '1': 'Orders',
    '2': 'Pricing',
}

const localeOptions: LocaleOption[] = [
    {
        value: 'en-US',
        label: (
            <span>
                <FlagLanguageItem code={'en-US'} name={'English'} />
            </span>
        ),
        text: 'English',
        canBeDeleted: false,
    },
    {
        value: 'fr-FR',
        label: (
            <span>
                <FlagLanguageItem code={'fr-FR'} name={'French'} />
            </span>
        ),
        text: 'French',
    },
]

export const ForHelpCenterArticle: Story = Template.bind({})
ForHelpCenterArticle.args = {
    initialExpandedSections: [
        'details',
        'impact',
        'related-tickets',
        'engagement',
    ],
    children: (() => {
        const Wrapper = () => {
            const [metaTitle, setMetaTitle] = useState('How to process returns')
            const [excerpt, setExcerpt] = useState(
                'When a customer receives a defective item',
            )
            const [slug, setSlug] = useState(
                'when-a-customer-recieves-a-defective-item',
            )
            return (
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
                    settings={{
                        category: {
                            categoryId: null,
                            categoryTitlesById,
                            categoryOptions,
                            onChangeCategory: () => {},
                        },
                        language: {
                            locale: 'en-US',
                            localeOptions,
                            onChangeLanguage: () => {},
                            onActionClick: () => {},
                        },
                        visibility: {
                            visibilityStatus: 'PUBLIC',
                            onChangeVisibility: () => {},
                            showNotification: false,
                            setShowNotification: () => {},
                            isParentUnlisted: false,
                        },
                        slug: {
                            slug,
                            onChangeSlug: setSlug,
                            articleId: 12345,
                        },
                        excerpt: {
                            excerpt,
                            onChangeExcerpt: setExcerpt,
                        },
                        metaTitle: {
                            metaTitle,
                            onChangeMetaTitle: setMetaTitle,
                        },
                        title: 'How to process returns',
                    }}
                />
            )
        }
        return <Wrapper />
    })(),
}

export const ForHelpCenterNewArticle: Story = Template.bind({})
ForHelpCenterNewArticle.args = {
    initialExpandedSections: [
        'details',
        'impact',
        'related-tickets',
        'engagement',
    ],
    children: (() => {
        const Wrapper = () => {
            const [metaTitle, setMetaTitle] = useState('')
            const [excerpt, setExcerpt] = useState('')
            const [slug, setSlug] = useState('')
            return (
                <KnowledgeEditorSidePanelHelpCenterArticle
                    details={{}}
                    impact={{}}
                    relatedTickets={{}}
                    engagement={{}}
                    settings={{
                        category: {
                            categoryId: null,
                            categoryTitlesById,
                            categoryOptions,
                            onChangeCategory: () => {},
                        },
                        language: {
                            locale: 'en-US',
                            localeOptions,
                            onChangeLanguage: () => {},
                            onActionClick: () => {},
                        },
                        visibility: {
                            visibilityStatus: 'PUBLIC',
                            onChangeVisibility: () => {},
                            showNotification: false,
                            setShowNotification: () => {},
                            isParentUnlisted: false,
                        },
                        slug: {
                            slug,
                            onChangeSlug: setSlug,
                            articleId: 12345,
                        },
                        excerpt: {
                            excerpt,
                            onChangeExcerpt: setExcerpt,
                        },
                        title: '',
                        metaTitle: {
                            metaTitle,
                            onChangeMetaTitle: setMetaTitle,
                        },
                    }}
                />
            )
        }
        return <Wrapper />
    })(),
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

export const ForHelpCenterArticleWithAutoSaveSaved: Story = Template.bind({})
ForHelpCenterArticleWithAutoSaveSaved.args = {
    initialExpandedSections: [
        'details',
        'impact',
        'related-tickets',
        'engagement',
        'settings',
    ],
    children: (() => {
        const Wrapper = () => {
            const [metaTitle, setMetaTitle] = useState('How to process returns')
            const [excerpt, setExcerpt] = useState(
                'When a customer receives a defective item',
            )
            const [slug, setSlug] = useState(
                'when-a-customer-recieves-a-defective-item',
            )
            return (
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
                    settings={{
                        category: {
                            categoryId: null,
                            categoryTitlesById,
                            categoryOptions,
                            onChangeCategory: () => {},
                        },
                        language: {
                            locale: 'en-US',
                            localeOptions,
                            onChangeLanguage: () => {},
                            onActionClick: () => {},
                        },
                        visibility: {
                            visibilityStatus: 'PUBLIC',
                            onChangeVisibility: () => {},
                            showNotification: false,
                            setShowNotification: () => {},
                            isParentUnlisted: false,
                        },
                        slug: {
                            slug,
                            onChangeSlug: setSlug,
                            articleId: 12345,
                        },
                        excerpt: {
                            excerpt,
                            onChangeExcerpt: setExcerpt,
                        },
                        metaTitle: {
                            metaTitle,
                            onChangeMetaTitle: setMetaTitle,
                        },
                        title: 'How to process returns',
                        autoSave: {
                            state: AutoSaveState.SAVED,
                            updatedAt: new Date(Date.now() - 2000),
                        },
                    }}
                />
            )
        }
        return <Wrapper />
    })(),
}

export const ForHelpCenterArticleWithAutoSaveSaving: Story = Template.bind({})
ForHelpCenterArticleWithAutoSaveSaving.args = {
    initialExpandedSections: [
        'details',
        'impact',
        'related-tickets',
        'engagement',
        'settings',
    ],
    children: (() => {
        const Wrapper = () => {
            const [metaTitle, setMetaTitle] = useState('How to process returns')
            const [excerpt, setExcerpt] = useState(
                'When a customer receives a defective item',
            )
            const [slug, setSlug] = useState(
                'when-a-customer-recieves-a-defective-item',
            )
            return (
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
                    settings={{
                        category: {
                            categoryId: null,
                            categoryTitlesById,
                            categoryOptions,
                            onChangeCategory: () => {},
                        },
                        language: {
                            locale: 'en-US',
                            localeOptions,
                            onChangeLanguage: () => {},
                            onActionClick: () => {},
                        },
                        visibility: {
                            visibilityStatus: 'PUBLIC',
                            onChangeVisibility: () => {},
                            showNotification: false,
                            setShowNotification: () => {},
                            isParentUnlisted: false,
                        },
                        slug: {
                            slug,
                            onChangeSlug: setSlug,
                            articleId: 12345,
                        },
                        excerpt: {
                            excerpt,
                            onChangeExcerpt: setExcerpt,
                        },
                        metaTitle: {
                            metaTitle,
                            onChangeMetaTitle: setMetaTitle,
                        },
                        title: 'How to process returns',
                        autoSave: {
                            state: AutoSaveState.SAVING,
                        },
                    }}
                />
            )
        }
        return <Wrapper />
    })(),
}

export const ForHelpCenterArticleWithAutoSaveStale: Story = Template.bind({})
ForHelpCenterArticleWithAutoSaveStale.args = {
    initialExpandedSections: [
        'details',
        'impact',
        'related-tickets',
        'engagement',
        'settings',
    ],
    children: (() => {
        const Wrapper = () => {
            const [metaTitle, setMetaTitle] = useState('How to process returns')
            const [excerpt, setExcerpt] = useState(
                'When a customer receives a defective item',
            )
            const [slug, setSlug] = useState(
                'when-a-customer-recieves-a-defective-item',
            )
            return (
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
                    settings={{
                        category: {
                            categoryId: null,
                            categoryTitlesById,
                            categoryOptions,
                            onChangeCategory: () => {},
                        },
                        language: {
                            locale: 'en-US',
                            localeOptions,
                            onChangeLanguage: () => {},
                            onActionClick: () => {},
                        },
                        visibility: {
                            visibilityStatus: 'PUBLIC',
                            onChangeVisibility: () => {},
                            showNotification: false,
                            setShowNotification: () => {},
                            isParentUnlisted: false,
                        },
                        slug: {
                            slug,
                            onChangeSlug: setSlug,
                            articleId: 12345,
                        },
                        excerpt: {
                            excerpt,
                            onChangeExcerpt: setExcerpt,
                        },
                        metaTitle: {
                            metaTitle,
                            onChangeMetaTitle: setMetaTitle,
                        },
                        title: 'How to process returns',
                        autoSave: {
                            state: AutoSaveState.INITIAL,
                            updatedAt: new Date(Date.now() - 5 * 60 * 1000),
                        },
                    }}
                />
            )
        }
        return <Wrapper />
    })(),
}
