import React, {ComponentProps, useState} from 'react'
import {Meta, StoryFn, StoryObj} from '@storybook/react'
import {
    AIArticleRecommendationItem,
    AllRecommendationsStatus,
} from '../hooks/useAIArticleRecommendationItems'
import AutomateAllRecommendationsCard from './AutomateAllRecommendationsCard'

const meta: Meta<typeof AutomateAllRecommendationsCard> = {
    title: 'Automate/AllRecommendationsCard',
    component: AutomateAllRecommendationsCard,
    argTypes: {
        paginatedItems: {control: 'object'},
        isLoading: {control: 'boolean'},
        itemsCount: {control: 'number'},
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
        currentPage: {control: 'number'},
    },
}

export default meta

type Story = StoryObj<typeof AutomateAllRecommendationsCard>

const Template: StoryFn<ComponentProps<typeof AutomateAllRecommendationsCard>> =
    (args) => {
        const [statusFilter, setStatusFilter] = useState(
            AllRecommendationsStatus.All
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
                setCurrentPage={setCurrentPage}
                onPageChange={onPageChange}
            />
        )
    }

const articles: AIArticleRecommendationItem[] = [
    {
        title: 'How can I ensure my apartment number is included on the shipping label?',
        templateKey: 'ai_article1',
        ticketsCount: 439,
        reviewAction: 'saveAsDraft',
    },
    {
        title: "What should I do if my package is marked as delivered but I haven't received it?",
        templateKey: 'ai_article2',
        ticketsCount: 287,
        reviewAction: 'publish',
    },
    {
        title: 'Are new customers eligible for any discounts?',
        templateKey: 'ai_article3',
        ticketsCount: 184,
        reviewAction: 'archive',
    },
    {
        title: 'What happens if I did not request to cancel my order but received a cancellation notice directly after I pass my order?',
        templateKey: 'ai_article4',
        ticketsCount: 112,
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
