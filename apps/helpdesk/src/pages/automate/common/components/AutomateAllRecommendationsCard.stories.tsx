import type { ComponentProps } from 'react'
import React, { useState } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryFn, StoryObj } from 'storybook-react-rsbuild'

import { appQueryClient } from 'api/queryClient'
import { billingState } from 'fixtures/billing'
import { HELP_CENTER_DEFAULT_LAYOUT } from 'pages/settings/helpCenter/constants'

import type { AIArticleRecommendationItem } from '../hooks/useAIArticleRecommendationItems'
import { AllRecommendationsStatus } from '../hooks/useAIArticleRecommendationItems'
import AutomateAllRecommendationsCard from './AutomateAllRecommendationsCard'

const currentUser = Map({
    id: Math.random() * 1000,
})

const defaultState = {
    currentUser,
    chats: fromJS({}),
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    1: {
                        type: 'faq',
                        default_locale: 'en-US',
                        layout: HELP_CENTER_DEFAULT_LAYOUT,
                        subdomain: 'toto',
                        id: 1,
                    },
                },
            },
        },
    },
    products: fromJS({}),
    billing: fromJS(billingState),
}

const meta: Meta<typeof AutomateAllRecommendationsCard> = {
    title: 'Automate/AllRecommendationsCard',
    component: AutomateAllRecommendationsCard,
    argTypes: {
        paginatedItems: { control: 'object' },
        isLoading: { control: 'boolean' },
        itemsCount: { control: 'number' },
        statusFilter: {
            control: {
                type: 'select',
                options: [
                    AllRecommendationsStatus.All,
                    AllRecommendationsStatus.ArticleCreated,
                    AllRecommendationsStatus.NotCreated,
                ],
            },
        },
        currentPage: { control: 'number' },
    },
    decorators: [
        (story) => (
            <Provider store={configureMockStore()(defaultState)}>
                <QueryClientProvider client={appQueryClient}>
                    <BrowserRouter>{story()}</BrowserRouter>
                </QueryClientProvider>
            </Provider>
        ),
    ],
}

export default meta

type Story = StoryObj<typeof AutomateAllRecommendationsCard>

const Template: StoryFn<
    ComponentProps<typeof AutomateAllRecommendationsCard>
> = (args) => {
    const [statusFilter, setStatusFilter] = useState(
        AllRecommendationsStatus.All,
    )
    const [currentPage, setCurrentPage] = useState(1)

    const onPageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <AutomateAllRecommendationsCard
            {...args}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            currentPage={currentPage}
            onPageChange={onPageChange}
            helpCenterId={1}
        />
    )
}

const articles: AIArticleRecommendationItem[] = [
    {
        title: 'How can I ensure my apartment number is included on the shipping label?',
        templateKey: 'ai_article1',
        ticketsCount: 439,
        createArticle: () => Promise.resolve(),
        reviewAction: 'saveAsDraft',
    },
    {
        title: "What should I do if my package is marked as delivered but I haven't received it?",
        templateKey: 'ai_article2',
        ticketsCount: 287,
        createArticle: () => Promise.resolve(),
        reviewAction: 'publish',
    },
    {
        title: 'Are new customers eligible for any discounts?',
        templateKey: 'ai_article3',
        ticketsCount: 184,
        createArticle: () => Promise.resolve(),
        reviewAction: 'archive',
    },
    {
        title: 'What happens if I did not request to cancel my order but received a cancellation notice directly after I pass my order?',
        templateKey: 'ai_article4',
        ticketsCount: 112,
        createArticle: () => Promise.resolve(),
    },
]

export const Default: Story = Template.bind({})
Default.args = {
    paginatedItems: articles,
    isLoading: false,
    itemsCount: articles.length,
}

export const Loading: Story = Template.bind({})
Loading.args = {
    paginatedItems: [],
    isLoading: true,
    itemsCount: 0,
}

export const NoArticles: Story = Template.bind({})
NoArticles.args = {
    paginatedItems: [],
    isLoading: false,
    itemsCount: 0,
}
