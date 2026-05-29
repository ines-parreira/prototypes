import React from 'react'
import { CalendarDate, parseDate } from '@internationalized/date'
import * as internationalizedDate from '@internationalized/date'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import {
    DATA_NOT_AVAILABLE_TOOLTIP_MESSAGE,
    DATA_NOT_YET_AVAILABLE_TOOLTIP_MESSAGE,
    DATA_PENDING_AUTOMATION_TOOLTIP_MESSAGE,
} from 'pages/aiAgent/analyticsAiAgent/constants'
import { getAiAgentDateTooltip } from 'pages/aiAgent/analyticsAiAgent/utils/getAiAgentDateTooltip'

jest.mock('@internationalized/date', () => ({
    ...jest.requireActual('@internationalized/date'),
    today: jest.fn(),
    getLocalTimeZone: jest.fn(() => 'UTC'),
}))

// 2024-09-15; chosen to be well after MIN_DATE_FOR_AI_AGENT (2024-08-01)
const MOCK_TODAY = new CalendarDate(2024, 9, 15)

beforeEach(() => {
    jest.mocked(internationalizedDate.today).mockReturnValue(MOCK_TODAY)
})

const renderTooltip = (dateString: string) => {
    const result = getAiAgentDateTooltip(parseDate(dateString))
    if (!result) return null
    render(<>{result}</>)
    return screen
}

describe('getAiAgentDateTooltip', () => {
    describe('before MIN_DATE_FOR_AI_AGENT', () => {
        it('returns the not-available message for dates before 2024-08-01', () => {
            renderTooltip('2024-07-31')
            expect(
                screen.getByText(DATA_NOT_AVAILABLE_TOOLTIP_MESSAGE),
            ).toBeInTheDocument()
        })

        it('does not return the not-available message for MIN_DATE_FOR_AI_AGENT itself', () => {
            const result = getAiAgentDateTooltip(parseDate('2024-08-01'))
            expect(result).toBeUndefined()
        })
    })

    describe('future dates', () => {
        it('returns the not-yet-available message for tomorrow', () => {
            renderTooltip('2024-09-16')
            expect(
                screen.getByText(DATA_NOT_YET_AVAILABLE_TOOLTIP_MESSAGE),
            ).toBeInTheDocument()
        })
    })

    describe('within the 72-hour automation window', () => {
        it('returns the pending-automation message for today', () => {
            renderTooltip('2024-09-15')
            expect(
                screen.getByText(DATA_PENDING_AUTOMATION_TOOLTIP_MESSAGE),
            ).toBeInTheDocument()
        })

        it('returns the pending-automation message for yesterday', () => {
            renderTooltip('2024-09-14')
            expect(
                screen.getByText(DATA_PENDING_AUTOMATION_TOOLTIP_MESSAGE),
            ).toBeInTheDocument()
        })

        it('returns the pending-automation message for 2 days ago (boundary)', () => {
            renderTooltip('2024-09-13')
            expect(
                screen.getByText(DATA_PENDING_AUTOMATION_TOOLTIP_MESSAGE),
            ).toBeInTheDocument()
        })
    })

    describe('historical dates outside the automation window', () => {
        it('returns undefined for 3 days ago', () => {
            const result = getAiAgentDateTooltip(parseDate('2024-09-12'))
            expect(result).toBeUndefined()
        })

        it('returns undefined for dates well in the past', () => {
            const result = getAiAgentDateTooltip(parseDate('2024-08-01'))
            expect(result).toBeUndefined()
        })
    })
})
