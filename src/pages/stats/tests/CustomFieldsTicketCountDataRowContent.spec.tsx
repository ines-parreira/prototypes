import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {BREAKDOWN_FIELD, VALUE_FIELD} from 'hooks/reporting/withBreakdown'
import {CustomFieldsTicketCountDataRowContent} from 'pages/stats/CustomFieldsTicketCountDataRowContent'
import {getValueMode, ValueMode} from 'state/ui/stats/ticketInsightsSlice'
import {assumeMock, mockStore} from 'utils/testing'

jest.mock('state/ui/stats/ticketInsightsSlice')
const getValueModeMock = assumeMock(getValueMode)

describe('<CustomFieldsTicketCountDataRowContent />', () => {
    beforeEach(() => {
        getValueModeMock.mockReturnValue(ValueMode.TotalCount)
    })

    it('should format total count values with thousands separator', () => {
        const value = 1234
        const valueWithSeparator = '1,234'
        const props = {
            [BREAKDOWN_FIELD]: 'someTag',
            [VALUE_FIELD]: 3456,
            timeSeries: [
                {dateTime: '2023-08-09', value, percentage: 15, decile: 2},
            ],
            percentage: 15,
            decile: 2,
        }

        render(
            <Provider store={mockStore({} as any)}>
                <CustomFieldsTicketCountDataRowContent {...props} />
            </Provider>
        )

        expect(screen.getByText(valueWithSeparator)).toBeInTheDocument()
        expect(screen.getByText('3,456')).toBeInTheDocument()
    })

    it('should format values as percentages', () => {
        getValueModeMock.mockReturnValue(ValueMode.Percentage)
        const totalPercent = 44.44
        const formattedTotalValue = '44%'
        const percent = 30
        const formattedPercent = '30%'
        const props = {
            [BREAKDOWN_FIELD]: 'someTag',
            [VALUE_FIELD]: 56,
            timeSeries: [
                {
                    dateTime: '2023-08-09',
                    value: 15,
                    percentage: percent,
                    decile: 2,
                },
            ],
            percentage: totalPercent,
            decile: 2,
        }

        render(
            <Provider store={mockStore({} as any)}>
                <CustomFieldsTicketCountDataRowContent {...props} />
            </Provider>
        )

        expect(screen.getByText(formattedTotalValue)).toBeInTheDocument()
        expect(screen.getByText(formattedPercent)).toBeInTheDocument()
    })

    it('should format small values as refined-percentages', () => {
        getValueModeMock.mockReturnValue(ValueMode.Percentage)
        const lessThenHalfValue = 0.4
        const lessThenHalfValueAsRefinedPercentage = '0.4%'
        const percent = 0.31
        const formattedPercent = '0.3%'
        const props = {
            [BREAKDOWN_FIELD]: 'someTag',
            [VALUE_FIELD]: 12,
            timeSeries: [
                {
                    dateTime: '2023-08-09',
                    value: 5,
                    percentage: lessThenHalfValue,
                    decile: 2,
                },
            ],
            percentage: percent,
            decile: 2,
        }

        render(
            <Provider store={mockStore({} as any)}>
                <CustomFieldsTicketCountDataRowContent {...props} />
            </Provider>
        )

        expect(
            screen.getByText(lessThenHalfValueAsRefinedPercentage)
        ).toBeInTheDocument()
        expect(screen.getByText(formattedPercent)).toBeInTheDocument()
    })

    it('should render 0 when value missing', () => {
        const props = {
            [BREAKDOWN_FIELD]: 'someTag',
            [VALUE_FIELD]: undefined,
            timeSeries: [
                {dateTime: '2023-08-09', value: 123, percentage: 15, decile: 2},
            ],
            percentage: 15,
            decile: 2,
        }

        render(
            <Provider store={mockStore({} as any)}>
                <CustomFieldsTicketCountDataRowContent {...props} />
            </Provider>
        )

        expect(screen.getByText('0')).toBeInTheDocument()
    })
})
