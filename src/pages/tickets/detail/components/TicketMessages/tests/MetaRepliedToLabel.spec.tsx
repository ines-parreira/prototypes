import {render} from '@testing-library/react'
import React from 'react'

import MetaRepliedToLabel from 'pages/tickets/detail/components/TicketMessages/MetaRepliedToLabel'

describe('MetaRepliedToLabel', () => {
    const reply = {
        ticket_id: 1,
        ticket_message_id: 2,
    }

    it('should render with reply details', () => {
        const {getByText} = render(<MetaRepliedToLabel reply={reply} />)

        expect(getByText('responded via Messenger to')).toBeInTheDocument()
        expect(getByText('Comment')).toBeInTheDocument()
        expect(getByText('Comment')).toHaveAttribute('href', '1')
    })
})
