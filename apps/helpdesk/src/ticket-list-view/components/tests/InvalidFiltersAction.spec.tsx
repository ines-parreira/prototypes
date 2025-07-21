import React from 'react'

import { render } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useSplitTicketView } from 'split-ticket-view-toggle'

import InvalidFiltersAction from '../InvalidFiltersAction'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('split-ticket-view-toggle/hooks/useSplitTicketView')
const useSplitTicketViewMock = useSplitTicketView as jest.Mock

const mockDispatch = jest.fn()
const mockSetIsEnabled = jest.fn()

describe('<InvalidFiltersAction />', () => {
    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(mockDispatch)
        useSplitTicketViewMock.mockReturnValue({
            setIsEnabled: mockSetIsEnabled,
        })
    })

    it('should render', () => {
        const { getByText } = render(<InvalidFiltersAction />)

        expect(getByText('Fix filters')).toBeInTheDocument()
    })

    it('should call setIsEnabled and dispatch on click', () => {
        useAppSelectorMock.mockReturnValue({ id: 1 })

        const { getByText } = render(<InvalidFiltersAction />)
        getByText('Fix filters').click()

        expect(mockSetIsEnabled).toHaveBeenCalledWith(false)
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ view: { id: 1 } }),
        )
    })
})
