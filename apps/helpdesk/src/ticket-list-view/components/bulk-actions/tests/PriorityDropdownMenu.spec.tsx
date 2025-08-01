import { ComponentProps, ContextType } from 'react'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TicketPriority } from '@gorgias/helpdesk-types'

import { DropdownContext } from 'pages/common/components/dropdown/Dropdown'

import PriorityDropdownMenu from '../PriorityDropdownMenu'

describe('<PriorityDropdownMenu />', () => {
    const minProps = {
        onClick: jest.fn(),
    }

    const mockContext: ContextType<typeof DropdownContext> = {
        isMultiple: false,
        value: null,
        query: '',
        onToggle: jest.fn(),
        getHighlightedLabel: (string) => string,
        onQueryChange: jest.fn(),
    }

    const renderComponent = (
        props: ComponentProps<typeof PriorityDropdownMenu> = minProps,
    ) =>
        render(
            <DropdownContext.Provider value={mockContext}>
                <PriorityDropdownMenu {...props} />
            </DropdownContext.Provider>,
        )

    it('should render priority options in reverse order', () => {
        renderComponent()

        const priorityOptions = Object.values(TicketPriority).reverse()
        priorityOptions.forEach((priority) => {
            expect(
                screen.getByText(new RegExp(priority, 'i')),
            ).toBeInTheDocument()
        })
    })

    it('should call onClick with priority when option is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const highPriorityOption = screen.getByText('High')
        await user.click(highPriorityOption)

        expect(minProps.onClick).toHaveBeenCalledWith(
            expect.objectContaining({ name: TicketPriority.High }),
        )
    })
})
