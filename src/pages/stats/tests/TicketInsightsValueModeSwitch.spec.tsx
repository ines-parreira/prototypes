import {act, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    PERCENTAGE_LABEL,
    TicketInsightsValueModeSwitch,
    TOTAL_COUNT_LABEL,
} from 'pages/stats/TicketInsightsValueModeSwitch'
import {toggleValueMode, ValueMode} from 'state/ui/stats/ticketInsightsSlice'
import {assumeMock} from 'utils/testing'
import useAppSelector from 'hooks/useAppSelector'

jest.mock('hooks/useAppSelector')
jest.mock('state/ui/stats/ticketInsightsSlice')
jest.mock('hooks/useAppDispatch', () => jest.fn())

const useAppSelectorMock = useAppSelector as jest.Mock
const useAppDispatchMock = useAppDispatch as jest.Mock
const toggleValueModeMock = assumeMock(toggleValueMode)

describe('<TicketInsightsValueModeSwitch />', () => {
    const dispatch: jest.Mock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatch)
    })

    it('should render TotalCount mode as active when selected', () => {
        useAppSelectorMock.mockReturnValue(ValueMode.TotalCount)

        render(<TicketInsightsValueModeSwitch />)

        expect(
            screen.getByRole('radio', {name: TOTAL_COUNT_LABEL})
        ).toBeChecked()
    })

    it('should render Percentage mode as active when selected', () => {
        useAppSelectorMock.mockReturnValue(ValueMode.Percentage)

        render(<TicketInsightsValueModeSwitch />)

        expect(
            screen.getByRole('radio', {name: PERCENTAGE_LABEL})
        ).toBeChecked()
    })

    it('should dispatch mode toggle action on click', async () => {
        useAppSelectorMock.mockReturnValue(ValueMode.TotalCount)

        render(<TicketInsightsValueModeSwitch />)

        act(() => {
            const radioButton = screen.getByRole('radio', {
                name: PERCENTAGE_LABEL,
            })
            userEvent.click(radioButton)
        })

        await waitFor(() => {
            expect(toggleValueModeMock).toHaveBeenCalled()
        })
    })
})
