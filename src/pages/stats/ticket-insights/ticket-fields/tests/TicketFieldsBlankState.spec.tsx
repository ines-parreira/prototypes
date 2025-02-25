import React from 'react'

import { render, screen } from '@testing-library/react'

import {
    BLANK_STATE_TEXT,
    BLANK_STATE_TITLE,
    TicketFieldsBlankState,
} from 'pages/stats/ticket-insights/ticket-fields/TicketFieldsBlankState'

describe('<TicketFieldsBlankState>', () => {
    it('should render', () => {
        render(<TicketFieldsBlankState />)

        expect(screen.getByText(BLANK_STATE_TEXT)).toBeInTheDocument()
        expect(screen.getByText(BLANK_STATE_TITLE)).toBeInTheDocument()
    })
})
