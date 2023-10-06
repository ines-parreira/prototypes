import React from 'react'
import {Meta, StoryObj} from '@storybook/react'

import OverviewCard from './OverviewCard'

const meta: Meta<typeof OverviewCard> = {
    title: 'Help Center Stats/OverviewCard ',
    component: OverviewCard,
    argTypes: {
        tipContent: {
            table: {
                disable: true,
            },
        },
        hintTitle: {
            table: {
                disable: true,
            },
        },
    },
}

export default meta

type Story = StoryObj<typeof OverviewCard>
export const ArticleOverview: Story = {
    render: (args) => <OverviewCard {...args} />,
    args: {
        trendValue: 45620,
        prevTrendValue: 44707,
        showTip: true,
        isLoading: false,
        title: 'Article overview',
        hintTitle:
            'Total number of article views, including duplicate views by the same user',
        startDate: '1696516016305',
        endDate: '1696516016305',
        tipContent: (
            <div>
                Check out our{' '}
                <a
                    href="https://docs.gorgias.com/en-US"
                    target="_blank"
                    rel="noreferrer"
                >
                    Help Docs
                </a>{' '}
                to learn about strategies you can use to increase article views
                for your Help Center.
            </div>
        ),
    },
}

export const SearchOverview: Story = {
    render: (args) => <OverviewCard {...args} />,
    args: {
        trendValue: 12540,
        prevTrendValue: 10503,
        showTip: true,
        isLoading: false,
        title: 'Searches',
        startDate: '1696516016305',
        endDate: '1696516016305',
        hintTitle: 'Total number of searches performed in the Help Center',
        tipContent: (
            <>
                <p>
                    You can reference the Searched Terms table to understand the
                    top queries in your Help Center to prioritize refining the
                    content of relevant articles or creating a new one.
                </p>
                <a
                    href="https://docs.gorgias.com/en-US"
                    target="_blank"
                    rel="noreferrer"
                >
                    <i className="material-icons">menu_book</i> How to improve
                    search relevancy
                </a>
            </>
        ),
    },
}
