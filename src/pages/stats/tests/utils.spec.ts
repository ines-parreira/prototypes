import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import {ChartArea, TooltipItem} from 'chart.js'
import moment from 'moment'

import {DisplayEventType} from 'hooks/reporting/automate/automateStatsMeasureLabelMap'
import {getAutomateColorsForEventType} from 'hooks/reporting/automate/utils'
import {ReportingGranularity} from 'models/reporting/types'
import {
    getGradient,
    renderTickLabelAsNumber,
    renderTickLabelAsPercentage,
    renderTooltipLabelAsPercentage,
    formatDates,
    getUtcPeriodFromDateAndGranularity,
    getIconNameBySign,
    highlightString,
} from 'pages/stats/utils'
import {
    MONTH_AND_YEAR_SHORT,
    SHORT_DATE_FORMAT_US,
    SHORT_DATE_FORMAT_WORLD,
    SHORT_DATE_WITH_DAY_OF_THE_WEEK_FORMAT_US,
    SHORT_DATE_WITH_DAY_OF_THE_WEEK_FORMAT_WORLD,
} from 'utils/date'
import {formatReportingQueryDate} from 'utils/reporting'

describe('getGradient', () => {
    it('should return color if canvasArea or canvasContext is not defined', () => {
        const color = 'red'

        expect(getGradient(color)).toEqual(color)
    })

    it('should return gradient if canvasArea and canvasContext are defined', () => {
        const color = 'red'
        const canvasArea = {bottom: 100} as ChartArea
        const linearGradient = {addColorStop: jest.fn()}
        const canvasContext = {
            createLinearGradient: jest.fn(() => linearGradient),
        } as any as CanvasRenderingContext2D

        expect(getGradient(color, canvasArea, canvasContext)).toEqual(
            linearGradient
        )
        expect(canvasContext.createLinearGradient).toHaveBeenCalledWith(
            0,
            0,
            0,
            100
        )
    })
})

describe('renderTooltipLabelAsPercentage', () => {
    const baseContext = {
        dataset: {label: 'label'},
        parsed: {y: 50},
    } as any as TooltipItem<'line'>

    it('should return formatted label', function () {
        expect(renderTooltipLabelAsPercentage(baseContext)).toEqual(
            'label: 50%'
        )
    })

    it('should return label if y is null', function () {
        const context = {
            ...baseContext,
            parsed: {y: null},
        } as any as TooltipItem<'line'>

        expect(renderTooltipLabelAsPercentage(context)).toEqual('label')
    })

    it('should return label if y is undefined', function () {
        const context = {
            ...baseContext,
            parsed: {},
        } as any as TooltipItem<'line'>

        expect(renderTooltipLabelAsPercentage(context)).toEqual('label')
    })

    it('should return formatted value if label is not defined', function () {
        const context = {
            ...baseContext,
            dataset: {},
        } as any as TooltipItem<'line'>

        expect(renderTooltipLabelAsPercentage(context)).toEqual('50%')
    })
})

describe('renderTickLabelAsPercentage', () => {
    it.each([
        [50, '50%'],
        [-50, '-50%'],
        [0, '0%'],
        ['rainbow', 'rainbow'],
    ])('For %p should return formatted as %p', (value, expected) => {
        expect(renderTickLabelAsPercentage(value)).toEqual(expected)
    })
})

describe('renderTickLabelAsNumber', () => {
    it.each([
        [50, '50'],
        [-50, '-50'],
        [0, '0'],
        ['rainbow', 'rainbow'],
    ])('For %p should return formatted as %p', (value, expected) => {
        expect(renderTickLabelAsNumber(value)).toEqual(expected)
    })
})

describe('formatDates', () => {
    const languageMock = jest.fn()
    Object.defineProperty(global.navigator, 'language', {
        get: languageMock,
    })
    const date = moment()

    it.each([
        {
            locale: 'en-US',
            granularity: ReportingGranularity.Day,
            formatted: date.format(SHORT_DATE_WITH_DAY_OF_THE_WEEK_FORMAT_US),
        },
        {
            locale: 'world',
            granularity: ReportingGranularity.Day,
            formatted: date.format(
                SHORT_DATE_WITH_DAY_OF_THE_WEEK_FORMAT_WORLD
            ),
        },
        {
            locale: 'en-US',
            granularity: ReportingGranularity.Week,
            formatted: `${date.format(SHORT_DATE_FORMAT_US)} - ${date
                .clone()
                .add(6, 'days')
                .format(SHORT_DATE_FORMAT_US)}`,
        },
        {
            locale: 'world',
            granularity: ReportingGranularity.Week,
            formatted: `${date.format(SHORT_DATE_FORMAT_WORLD)} - ${date
                .clone()
                .add(6, 'days')
                .format(SHORT_DATE_FORMAT_WORLD)}`,
        },
        {
            locale: 'en-US',
            granularity: ReportingGranularity.Month,
            formatted: date.format(MONTH_AND_YEAR_SHORT),
        },
        {
            locale: 'world',
            granularity: ReportingGranularity.Month,
            formatted: date.format(MONTH_AND_YEAR_SHORT),
        },
    ])(
        'should format dates based on granularity ($granularity) and Users`s locale ($locale)',
        ({locale, granularity, formatted}) => {
            languageMock.mockReturnValue(locale)

            expect(formatDates(granularity, date.toISOString())).toEqual(
                formatted
            )
        }
    )
})

describe('getPeriodEndDateTime', () => {
    const startDateTime = '2023-12-19T00:00:00.000'

    const testCases: {
        period: {
            start_datetime: string
            end_datetime: string
        }
        granularity:
            | ReportingGranularity.Hour
            | ReportingGranularity.Day
            | ReportingGranularity.Week
            | ReportingGranularity.Month
    }[] = [
        {
            granularity: ReportingGranularity.Day,
            period: {
                start_datetime: formatReportingQueryDate(
                    moment.utc(startDateTime).toISOString()
                ),
                end_datetime: formatReportingQueryDate(
                    moment
                        .utc(startDateTime)
                        .endOf(ReportingGranularity.Day)
                        .toISOString()
                ),
            },
        },
        {
            granularity: ReportingGranularity.Day,
            period: {
                start_datetime: startDateTime,
                end_datetime: '2023-12-19T23:59:59.999',
            },
        },
        {
            granularity: ReportingGranularity.Week,
            period: {
                start_datetime: startDateTime,
                end_datetime: formatReportingQueryDate(
                    moment
                        .utc(startDateTime)
                        .clone()
                        .add(6, 'days')
                        .toISOString()
                ),
            },
        },
        {
            granularity: ReportingGranularity.Month,
            period: {
                start_datetime: formatReportingQueryDate(
                    moment(startDateTime).startOf('month').toISOString()
                ),
                end_datetime: formatReportingQueryDate(
                    moment(startDateTime).endOf('month').toISOString()
                ),
            },
        },
    ]

    it.each(testCases)(
        'should return end date time based on granularity ($granularity) and start date time',
        ({period, granularity}) => {
            expect(
                getUtcPeriodFromDateAndGranularity(startDateTime, granularity)
            ).toEqual(period)
        }
    )
})

describe('getIconNameBySign', () => {
    it('returns "arrow_upward" when the sign is positive', () => {
        expect(getIconNameBySign(1)).toBe('arrow_upward')
    })

    it('returns "arrow_downward" when the sign is negative', () => {
        expect(getIconNameBySign(-1)).toBe('arrow_downward')
    })

    it('returns null when the sign is zero', () => {
        expect(getIconNameBySign(0)).toBeNull()
    })

    it('returns "arrow_upward" when the sign is a positive non-integer', () => {
        expect(getIconNameBySign(0.5)).toBe('arrow_upward')
    })

    it('returns "arrow_downward" when the sign is a negative non-integer', () => {
        expect(getIconNameBySign(-0.5)).toBe('arrow_downward')
    })
})

describe('highlightString', () => {
    it('should highlight string', () => {
        expect(highlightString('test', 'es')).toEqual('t<b>es</b>t')
    })

    it('should highlight string with multiple matches', () => {
        expect(highlightString('test test', 'es')).toEqual(
            't<b>es</b>t t<b>es</b>t'
        )
    })

    it('should highlight string with case insensitive', () => {
        expect(highlightString('Test', 'ES')).toEqual('T<b>es</b>t')
    })

    it('should return the same string if highlight is not found', () => {
        expect(highlightString('test', 'no')).toEqual('test')
    })

    it('should return the same string if highlight is empty', () => {
        expect(highlightString('test', '')).toEqual('test')
    })
})

describe('getAutomateColorsForEventType', () => {
    const classicColors = colors['📺 Classic']
    it('should return Exact colors', () => {
        expect(
            getAutomateColorsForEventType(DisplayEventType.AI_AGENT)
        ).toEqual(classicColors.Accessory.Navy_text.value)
        expect(
            getAutomateColorsForEventType(DisplayEventType.WORKFLOWS)
        ).toEqual(classicColors.Main.Variations.Primary_3.value)
        expect(
            getAutomateColorsForEventType(
                DisplayEventType.QUICK_RESPONSES_DEPRECATED
            )
        ).toEqual(classicColors.Feedback.Variations.Warning_3.value)
        expect(
            getAutomateColorsForEventType(
                DisplayEventType.ARTICLE_RECOMMENDATION
            )
        ).toEqual(classicColors.Accessory.Purple_text.value)
        expect(
            getAutomateColorsForEventType(DisplayEventType.RETURN_ORDER)
        ).toEqual(classicColors.Feedback.Variations.Error_3.value)
        expect(
            getAutomateColorsForEventType(DisplayEventType.REPORT_ORDER_ISSUE)
        ).toEqual(classicColors.Neutral.Grey_5.value)
        expect(
            getAutomateColorsForEventType(DisplayEventType.AUTORESPONDERS)
        ).toEqual(classicColors.Accessory.Yellow_text.value)
    })
})
