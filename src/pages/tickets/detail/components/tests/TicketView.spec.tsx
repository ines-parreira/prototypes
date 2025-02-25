import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { assumeMock } from 'utils/testing'

import TicketView from '../TicketView'

jest.mock('../TicketBody', () => () => <div>TicketBody</div>)
jest.mock('../TicketBodyNonVirtualized', () => () => (
    <div>TicketBodyNonVirtualized</div>
))
jest.mock('../TicketHeaderWrapper/TicketHeaderWrapper', () => () => (
    <div>TicketHeaderWrapper</div>
))
jest.mock('../ReplyForm', () => () => <div>ReplyForm</div>)

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)
const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

describe('<TicketView />', () => {
    const minProps = {
        hideTicket: jest.fn(),
        isTicketHidden: false,
        setStatus: jest.fn(),
        submit: jest.fn(),
    } as unknown as ComponentProps<typeof TicketView>

    beforeEach(() => {
        mockUseAppSelector
            .mockReturnValueOnce(fromJS({}))
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(
                fromJS({
                    _internal: {
                        isShopperTyping: false,
                    },
                }),
            )
            .mockReturnValueOnce(
                fromJS({
                    _internal: {
                        isShopperTyping: false,
                    },
                }),
            )
    })

    it('should not have the hidden classes', () => {
        const { container } = render(<TicketView {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should have the hidden classes', () => {
        const { container } = render(
            <TicketView {...minProps} isTicketHidden />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
