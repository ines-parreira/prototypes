import {render} from '@testing-library/react'
import React from 'react'

import TicketTrash from '../TicketTrash'

describe('TicketTrash', () => {
    describe('props', () => {
        it('should use default props', () => {
            const {container} = render(<TicketTrash />)

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('html', () => {
        it('should display trash icon', () => {
            const {container} = render(<TicketTrash trashed={true} />)

            expect(container.firstChild).toMatchSnapshot()
        })
        it('should not display a trash icon', () => {
            const {container} = render(<TicketTrash />)

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
