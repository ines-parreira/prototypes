import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { ArticleViewsGraphComponent } from 'domains/reporting/pages/help-center/components/ArticleViewsGraph/ArticleViewsGraph'

const meta: Meta<typeof ArticleViewsGraphComponent> = {
    title: 'Help Center Stats/ArticleViewsGraph ',
    component: ArticleViewsGraphComponent,
    argTypes: {
        data: {
            table: {
                disable: true,
            },
        },
    },
}

export default meta

type Story = StoryObj<typeof ArticleViewsGraphComponent>

const DATA: TimeSeriesDataItem[][] = [
    [
        {
            dateTime: new Date('10/01/2023').toDateString(),
            value: 2121,
        },
        {
            dateTime: new Date('10/02/2023').toDateString(),
            value: 2511,
        },
        {
            dateTime: new Date('10/03/2023').toDateString(),
            value: 2611,
        },
        {
            dateTime: new Date('10/04/2023').toDateString(),
            value: 3351,
        },
        {
            dateTime: new Date('10/05/2023').toDateString(),
            value: 4161,
        },

        {
            dateTime: new Date('10/06/2023').toDateString(),
            value: 4261,
        },
    ],
]

export const Default: Story = {
    render: (args) => <ArticleViewsGraphComponent {...args} data={DATA} />,
}
