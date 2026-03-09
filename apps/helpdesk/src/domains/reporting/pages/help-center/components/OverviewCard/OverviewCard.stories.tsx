import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import OverviewCard from 'domains/reporting/pages/help-center/components/OverviewCard/OverviewCard'

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

const mockStore = configureMockStore([thunk])
const store = mockStore()

export const ArticleOverview: Story = {
    render: (args) => (
        <Provider store={store}>
            <OverviewCard {...args} />
        </Provider>
    ),
    args: {
        trendValue: 45620,
        prevTrendValue: 44707,
        showTip: true,
        isLoading: false,
        title: 'Article overview',
        hintTitle:
            'Total number of article views, including duplicate views by the same user',
        startDate: '2023-12-11T23:59:59-08:00',
        endDate: '2023-12-05T00:00:00-08:00',
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
    render: (args) => (
        <Provider store={store}>
            <OverviewCard {...args} />
        </Provider>
    ),
    args: {
        trendValue: 12540,
        prevTrendValue: 10503,
        showTip: true,
        isLoading: false,
        title: 'Searches',
        startDate: '2023-12-11T23:59:59-08:00',
        endDate: '2023-12-05T00:00:00-08:00',
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
