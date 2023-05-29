import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {assumeMock} from 'utils/testing'
import {
    formatMetricTrend,
    formatMetricValue,
    MetricTrendFormat,
    MetricValueFormat,
} from 'pages/stats/common/utils'

import TrendMetricCard from '../TrendMetricCard'
import TrendBadge from '../TrendBadge'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid="skeleton" />
))

jest.mock(
    '../TrendBadge',
    () =>
        ({color, children}: ComponentProps<typeof TrendBadge>) => {
            return (
                <div data-testid="trend-badge" data-color={color}>
                    {children}
                </div>
            )
        }
)

jest.mock('pages/stats/common/utils')
const formatMetricTrendMock = assumeMock(formatMetricTrend)
const formatMetricValueMock = assumeMock(formatMetricValue)

describe('TrendMetricCard', () => {
    const minProps: ComponentProps<typeof TrendMetricCard> = {
        title: 'Title',
        hint: 'Hint',
        data: {
            value: 123,
            prevValue: 234,
        },
        children: ({formattedValue, formattedPrevValue}) =>
            `${formattedValue} from ${formattedPrevValue}`,
    }

    beforeEach(() => {
        jest.resetAllMocks()
        formatMetricValueMock.mockReturnValue('formatted-metric-value')
        formatMetricTrendMock.mockReturnValue({
            formattedTrend: 'formatted-metric-trend',
        })
    })

    it('should render the trend metric card', () => {
        const {container} = render(<TrendMetricCard {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render skeleton when no data', () => {
        const {getAllByTestId} = render(
            <TrendMetricCard {...minProps} data={undefined} />
        )
        expect(getAllByTestId('skeleton')).toHaveLength(2)
    })

    it.each(['decimal', 'duration'] as MetricValueFormat[])(
        'should call formatMetricValue with %s valueFormat',
        (valueFormat) => {
            render(<TrendMetricCard {...minProps} valueFormat={valueFormat} />)
            expect(formatMetricValueMock).toHaveBeenCalledWith(
                minProps.data?.value,
                valueFormat
            )
            expect(formatMetricValueMock).toHaveBeenCalledWith(
                minProps.data?.prevValue,
                valueFormat
            )
        }
    )

    it.each(['decimal', 'duration', 'percent'] as MetricTrendFormat[])(
        'should call formatMetricTrend with %s trendFormat',
        (valueFormat) => {
            render(<TrendMetricCard {...minProps} trendFormat={valueFormat} />)
            expect(formatMetricTrendMock).toHaveBeenCalledWith(
                minProps.data?.value,
                minProps.data?.prevValue,
                valueFormat
            )
        }
    )

    describe.each<
        [
            string,
            ComponentProps<typeof TrendMetricCard>['interpretAs'],
            string,
            string,
            string
        ]
    >([
        ['more is better', 'more-is-better', 'positive', 'negative', 'neutral'],
        ['less is better', 'less-is-better', 'negative', 'positive', 'neutral'],
        ['neutral', 'neutral', 'neutral', 'neutral', 'neutral'],
    ])(
        '%s interpretation',
        (
            testName,
            interpretation,
            uptrendColor,
            downtrendColor,
            flatTrendColor
        ) => {
            it(`should render ${uptrendColor} color TrendBadge when trend is up`, () => {
                formatMetricTrendMock.mockReturnValue({
                    formattedTrend: 'formatted-metric-trend',
                    sign: 1,
                })
                const renderFn = jest.fn()
                const {getByTestId} = render(
                    <TrendMetricCard
                        {...minProps}
                        data={{
                            value: 2,
                            prevValue: 1,
                        }}
                        interpretAs={interpretation}
                    >
                        {renderFn}
                    </TrendMetricCard>
                )

                expect(getByTestId('trend-badge').dataset['color']).toBe(
                    uptrendColor
                )
            })

            it(`should render ${downtrendColor} color TrendBadge when trend is down`, () => {
                formatMetricTrendMock.mockReturnValue({
                    formattedTrend: 'formatted-metric-trend',
                    sign: -1,
                })
                const renderFn = jest.fn()
                const {getByTestId} = render(
                    <TrendMetricCard
                        {...minProps}
                        data={{
                            value: 1,
                            prevValue: 2,
                        }}
                        interpretAs={interpretation}
                    >
                        {renderFn}
                    </TrendMetricCard>
                )

                expect(getByTestId('trend-badge').dataset['color']).toBe(
                    downtrendColor
                )
            })

            it(`should render ${flatTrendColor} color TrendBadge when trend is flat`, () => {
                const renderFn = jest.fn()
                const {getByTestId} = render(
                    <TrendMetricCard
                        {...minProps}
                        data={{
                            value: 1,
                            prevValue: 1,
                        }}
                        interpretAs={interpretation}
                    >
                        {renderFn}
                    </TrendMetricCard>
                )

                expect(getByTestId('trend-badge').dataset['color']).toBe(
                    flatTrendColor
                )
            })
        }
    )

    it('should not render trend badge when diff is not available', () => {
        const {queryByTestId} = render(
            <TrendMetricCard {...minProps} data={{prevValue: null, value: 3}} />
        )
        expect(queryByTestId('trend-badge')).not.toBeInTheDocument()
    })

    it('should not render trend badge when formattedTrend is null', () => {
        formatMetricTrendMock.mockReturnValue({
            formattedTrend: null,
        })
        const {queryByTestId} = render(
            <TrendMetricCard {...minProps} data={{prevValue: 0, value: 3}} />
        )

        expect(queryByTestId('trend-badge')).not.toBeInTheDocument()
    })

    it('should render unavailable text when no value is available', () => {
        const notAvailableText = 'FOO'
        const {getByText} = render(
            <TrendMetricCard
                {...minProps}
                data={{prevValue: null, value: null}}
                notAvailableText={notAvailableText}
            />
        )
        expect(
            getByText(`${notAvailableText} from ${notAvailableText}`)
        ).toBeInTheDocument()
    })
})
