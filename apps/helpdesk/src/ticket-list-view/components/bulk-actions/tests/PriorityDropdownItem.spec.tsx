import { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'

import { TicketPriority } from '@gorgias/helpdesk-types'

import PriorityDropdownItem from '../PriorityDropdownItem'

describe('<PriorityDropdownItem />', () => {
    const minProps = {
        item: {
            name: TicketPriority.High,
        },
    }

    const renderComponent = (
        props: ComponentProps<typeof PriorityDropdownItem> = minProps,
    ) => render(<PriorityDropdownItem {...props} />)

    it('should render priority icon and capitalized priority text', () => {
        renderComponent()

        expect(screen.getByLabelText(TicketPriority.High)).toBeInTheDocument()
        expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('should handle different priority values', () => {
        renderComponent({
            item: {
                name: TicketPriority.Low,
            },
        })

        expect(screen.getByLabelText(TicketPriority.Low)).toBeInTheDocument()
        expect(screen.getByText('Low')).toBeInTheDocument()
    })
})
