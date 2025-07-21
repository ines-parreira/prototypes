import React from 'react'

import { render } from '@testing-library/react'

import TicketSpam from '../TicketSpam'

describe('TicketSpam', () => {
    describe('props', () => {
        it('should use default props', () => {
            const { container } = render(<TicketSpam />)

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('html', () => {
        it('should display spam flag', () => {
            const { container } = render(<TicketSpam spam={true} />)

            expect(container.firstChild).toMatchSnapshot()
        })
        it('should not display a spam flag', () => {
            const { container } = render(<TicketSpam />)

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
