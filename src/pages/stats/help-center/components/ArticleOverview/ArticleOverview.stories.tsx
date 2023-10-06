import React from 'react'
import {Meta, Story} from '@storybook/react'

import ArticleOverview, {ArticleOverviewProps} from './ArticleOverview'

const storyConfig: Meta = {
    title: 'Help Center Stats/ArticleOverview ',
    component: ArticleOverview,
}

const Template: Story<ArticleOverviewProps> = (args) => {
    return <ArticleOverview {...args} />
}

export const Default = Template.bind({})
Default.args = {
    trendValue: 45620,
    prevTrendValue: 44707,
    showTip: true,
    isLoading: false,
}

export default storyConfig
