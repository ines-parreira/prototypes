import React from 'react'
import {render, screen} from '@testing-library/react'
import ArticleOverview, {ArticleOverviewProps} from './ArticleOverview'

const renderComponent = (props: Partial<ArticleOverviewProps>) => {
    return render(
        <ArticleOverview
            isLoading={false}
            trendValue={2}
            prevTrendValue={1}
            showTip={true}
            {...props}
        />
    )
}

describe('<ArticleOverview />', () => {
    it('should render', () => {
        const {container} = renderComponent({})

        expect(container).toMatchSnapshot()
    })

    it('should hide tip when showTip is false', () => {
        renderComponent({showTip: false})

        expect(
            screen.queryByText('article views for your Help Center')
        ).not.toBeInTheDocument()
    })
})
