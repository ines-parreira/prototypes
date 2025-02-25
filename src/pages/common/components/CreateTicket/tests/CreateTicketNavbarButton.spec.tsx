import React, { ReactNode } from 'react'

import { render } from '@testing-library/react'

import CreateTicketNavbarButton from 'pages/common/components/CreateTicket/CreateTicketNavbarButton'

jest.mock(
    '../CreateTicketButton',
    () =>
        ({ trigger }: { trigger: ReactNode }) => <div>{trigger}</div>,
)

describe('<CreateTicketNavbarButton />', () => {
    it('should render custom trigger in CreateTicketButton', () => {
        const { queryByText } = render(<CreateTicketNavbarButton />)

        expect(queryByText('Create Ticket')).toBeInTheDocument()
    })
})
