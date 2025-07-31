import React from 'react'

import { userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import _noop from 'lodash/noop'

import MergeTicketsContainer from 'pages/common/components/MergeTickets/MergeTicketsContainer'
import { renderWithStore } from 'utils/testing'

jest.mock('@gorgias/realtime', () => ({
    useAgentActivity: () => ({
        viewTickets: jest.fn(),
    }),
}))

describe('MergeTicketsContainer component', () => {
    const ticketSubject = 'foo'
    const baseTicket = fromJS({
        subject: ticketSubject,
        assignee_user: {
            id: 1,
            name: 'John Smith',
        },
        customer: {
            id: 22,
            name: 'Maria Curie',
        },
    }) as Map<any, any>

    const commonProps = {
        isOpen: true,
        toggleModal: _noop,
    }

    it('should render a closed modal because isOpen==false', () => {
        const props = { ...commonProps }
        props.isOpen = false

        const { container } = renderWithStore(
            <MergeTicketsContainer sourceTicket={baseTicket} {...props} />,
            {},
        )
        const modal = document.querySelector('.modal')

        expect(modal).not.toBeInTheDocument()
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the selection component if there is no selected ticket in the state', () => {
        renderWithStore(
            <MergeTicketsContainer
                sourceTicket={baseTicket}
                {...commonProps}
            />,
            {},
        )
        const modal = document.querySelector('.modal')

        expect(modal).toBeInTheDocument()
        expect(modal).toMatchSnapshot()
    })

    it('should render the build component if there is a selected ticket in the state', () => {
        renderWithStore(
            <MergeTicketsContainer
                sourceTicket={baseTicket}
                {...commonProps}
            />,
            {},
        )

        userEvent.click(screen.getByText(ticketSubject))
        const modal = document.querySelector('.modal')

        expect(modal).toBeInTheDocument()
        expect(modal).toMatchSnapshot()
    })
})
