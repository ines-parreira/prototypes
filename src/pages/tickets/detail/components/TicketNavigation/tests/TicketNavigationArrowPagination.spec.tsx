import React, {ComponentProps} from 'react'
import {render, screen, fireEvent} from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import * as ticketActions from 'state/ticket/actions'
import Tooltip from 'pages/common/components/Tooltip'
import TicketNavigationArrowPagination from '../TicketNavigationArrowPagination'
import usePrevNextTicketNavigation from '../hooks/usePrevNextTicketNavigation'

jest.mock('hooks/useAppDispatch', () => jest.fn())

jest.mock('../hooks/usePrevNextTicketNavigation', () => jest.fn())

// Mock Tooltip component
jest.mock(
    'pages/common/components/Tooltip',
    () =>
        ({children}: ComponentProps<typeof Tooltip>) =>
            <div>{children}</div>
)

describe('TicketNavigationArrowPagination', () => {
    const ticketId = '123'

    let dispatch: jest.Mock
    const useAppDispatchMock = useAppDispatch as jest.Mock
    const isTicketNavigationAvailableMock = jest.spyOn(
        ticketActions,
        'isTicketNavigationAvailable'
    )

    const usePrevNextTicketNavigationMock =
        usePrevNextTicketNavigation as jest.MockedFunction<
            typeof usePrevNextTicketNavigation
        >

    let goToPrevTicketMock: jest.Mock
    let goToNextTicketMock: jest.Mock

    beforeEach(() => {
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)

        goToPrevTicketMock = jest.fn()
        goToNextTicketMock = jest.fn()
        usePrevNextTicketNavigationMock
            .mockReturnValueOnce(goToPrevTicketMock)
            .mockReturnValueOnce(goToNextTicketMock)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render & test buttons: enabled PREV & enabled NEXT with tooltips', () => {
        useAppDispatchMock.mockReturnValue(jest.fn(() => true))

        render(<TicketNavigationArrowPagination ticketId={ticketId} />)

        const prevArrow = screen.getByText('keyboard_arrow_left')
        const nextArrow = screen.getByText('keyboard_arrow_right')

        expect(prevArrow.parentElement?.id).toEqual(
            'pagination-item-arrow-previous'
        )
        expect(screen.getByText('Previous ticket')).toBeInTheDocument()

        expect(nextArrow.parentElement?.id).toEqual(
            'pagination-item-arrow-next'
        )
        expect(screen.getByText('Next ticket')).toBeInTheDocument()

        fireEvent.click(prevArrow)
        fireEvent.click(nextArrow)

        expect(goToPrevTicketMock).toHaveBeenCalledTimes(1)
        expect(goToNextTicketMock).toHaveBeenCalledTimes(1)

        expect(isTicketNavigationAvailableMock).toHaveBeenCalledTimes(1)
    })

    it('should render without PREV & NEXT buttons', () => {
        render(<TicketNavigationArrowPagination ticketId={ticketId} />)

        const prevArrow = screen.queryByText('keyboard_arrow_left')
        const nextArrow = screen.queryByText('keyboard_arrow_right')

        expect(prevArrow).toBeNull()
        expect(nextArrow).toBeNull()

        expect(screen.queryByText('Previous ticket')).toBeNull()
        expect(screen.queryByText('Next ticket')).toBeNull()

        expect(isTicketNavigationAvailableMock).toHaveBeenCalledTimes(1)
    })
})
