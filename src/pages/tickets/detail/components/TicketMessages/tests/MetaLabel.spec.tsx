import {render} from '@testing-library/react'
import React from 'react'

import MetaLabel from 'pages/tickets/detail/components/TicketMessages/MetaLabel'

describe('MetaLabel', () => {
    it('should display a label and children', () => {
        const {getByText} = render(
            <MetaLabel label="via">
                <span>a test</span>
            </MetaLabel>
        )
        expect(getByText('via')).toBeInTheDocument()
        expect(getByText('a test')).toBeInTheDocument()
    })

    it('should display a spinner if isLoading', () => {
        const {queryByText} = render(
            <MetaLabel label="via" isLoading>
                <span>a test</span>
            </MetaLabel>
        )
        expect(queryByText('Loading...')).toBeInTheDocument()
        expect(queryByText('via')).not.toBeInTheDocument()
        expect(queryByText('a test')).not.toBeInTheDocument()
    })
})
