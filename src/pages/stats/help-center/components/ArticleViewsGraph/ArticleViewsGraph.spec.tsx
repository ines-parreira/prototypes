import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'
import moment from 'moment'
import {CoreScaleOptions, Scale} from 'chart.js'
import {UseQueryResult} from '@tanstack/react-query'
import {useArticleViewTimeSeries} from '../../hooks/useArticleViewTimeSeries'
import {TimeSeriesDataItem} from '../../../../../hooks/reporting/useTimeSeries'
import ArticleViewsGraph, {renderXTickLabel} from './ArticleViewsGraph'

jest.mock('../../hooks/useArticleViewTimeSeries', () => ({
    useArticleViewTimeSeries: jest.fn(),
}))

const mockUseArticleViewTimeSeries = jest.mocked(useArticleViewTimeSeries)
const defaultArticleViewTimeseriesResponse = {
    data: undefined,
    isFetching: false,
} as UseQueryResult<TimeSeriesDataItem[][]>

const renderComponent = (
    props: Partial<ComponentProps<typeof ArticleViewsGraph>>
) => {
    const statsFilters = {
        period: {
            end_datetime: new Date().toString(),
            start_datetime: new Date('01/08/2023').toString(),
        },
    }

    return render(
        <ArticleViewsGraph
            statsFilters={statsFilters}
            timezone="US"
            {...props}
        />
    )
}

describe('<ArticleViewsGraphComponent />', () => {
    beforeEach(() => {
        mockUseArticleViewTimeSeries.mockClear()
        mockUseArticleViewTimeSeries.mockReturnValue(
            defaultArticleViewTimeseriesResponse
        )
    })
    it('should render', () => {
        renderComponent({})

        expect(screen.getByText('Article views')).toBeInTheDocument()
    })

    it('should show loading state', () => {
        mockUseArticleViewTimeSeries.mockReturnValue({
            ...defaultArticleViewTimeseriesResponse,
            isFetching: true,
        })

        renderComponent({})

        expect(document.querySelector('.skeleton')).toBeInTheDocument()
    })

    describe('renderXTickLabel', () => {
        it('should return valid date', () => {
            expect(
                renderXTickLabel.call(
                    {
                        getLabelForValue: () => moment('2023-10-06'),
                    } as unknown as Scale<CoreScaleOptions>,
                    '',
                    0
                )
            ).toEqual('Oct 6')
        })

        it('should return input when date is invalid', () => {
            expect(
                renderXTickLabel.call(
                    {
                        getLabelForValue: () => 'invalid date',
                    } as unknown as Scale<CoreScaleOptions>,
                    '',
                    0
                )
            ).toEqual('invalid date')
        })
    })
})
