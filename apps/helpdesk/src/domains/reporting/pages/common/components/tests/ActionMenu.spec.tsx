import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import {
    ACTION_MENU_LABEL,
    ActionMenu,
    ActionMenuItem,
    ActionMenuLabel,
    ActionMenuSelectGroup,
    ActionMenuSelectItem,
    ActionMenuSeparator,
} from 'domains/reporting/pages/common/components/ActionMenu'

describe('ActionMenu', () => {
    it('should open and close the menu', () => {
        const { getByRole } = render(
            <ActionMenu>
                <ActionMenuItem label="Test Item" onClick={() => {}} />
            </ActionMenu>,
        )

        const trigger = getByRole('button', { name: ACTION_MENU_LABEL })
        userEvent.click(trigger)

        expect(screen.getByText('Test Item')).toBeInTheDocument()
    })

    it('should call onClick when menu item is clicked', () => {
        const handleClick = jest.fn()
        render(
            <ActionMenu>
                <ActionMenuItem label="Click Me" onClick={handleClick} />
            </ActionMenu>,
        )

        const trigger = screen.getByRole('button', { name: ACTION_MENU_LABEL })
        userEvent.click(trigger)
        userEvent.click(screen.getByText('Click Me'))

        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should render menu item with description', () => {
        render(
            <ActionMenu>
                <ActionMenuItem
                    label="Item"
                    description="Description text"
                    onClick={() => {}}
                />
            </ActionMenu>,
        )

        const trigger = screen.getByRole('button', { name: ACTION_MENU_LABEL })
        userEvent.click(trigger)

        expect(screen.getByText('Description text')).toBeInTheDocument()
    })

    it('should handle select group functionality', () => {
        const handleChange = jest.fn()
        render(
            <ActionMenu>
                <ActionMenuSelectGroup
                    value="option1"
                    onValueChange={handleChange}
                >
                    <ActionMenuSelectItem label="Option 1" value="option1" />
                    <ActionMenuSelectItem label="Option 2" value="option2" />
                </ActionMenuSelectGroup>
            </ActionMenu>,
        )

        const trigger = screen.getByRole('button', { name: ACTION_MENU_LABEL })
        userEvent.click(trigger)
        userEvent.click(screen.getByText('Option 2'))

        expect(handleChange).toHaveBeenCalledWith('option2')
    })

    it('should render with description when provided', () => {
        render(
            <ActionMenu>
                <ActionMenuSelectGroup value="option1" onValueChange={() => {}}>
                    <ActionMenuSelectItem
                        label="Test Item"
                        value="test"
                        description="This is a description"
                    />
                </ActionMenuSelectGroup>
            </ActionMenu>,
        )

        const trigger = screen.getByRole('button', { name: ACTION_MENU_LABEL })
        userEvent.click(trigger)

        expect(screen.getByText('This is a description')).toBeInTheDocument()
    })

    it('should render menu label', () => {
        render(
            <ActionMenu>
                <ActionMenuLabel>Category</ActionMenuLabel>
                <ActionMenuItem label="Item" onClick={() => {}} />
            </ActionMenu>,
        )

        const trigger = screen.getByRole('button', { name: ACTION_MENU_LABEL })
        userEvent.click(trigger)

        expect(screen.getByText('Category')).toBeInTheDocument()
    })

    it('should render separator', () => {
        render(
            <ActionMenu>
                <ActionMenuItem label="Item 1" onClick={() => {}} />
                <ActionMenuSeparator />
                <ActionMenuItem label="Item 2" onClick={() => {}} />
            </ActionMenu>,
        )

        const trigger = screen.getByRole('button', { name: ACTION_MENU_LABEL })
        userEvent.click(trigger)

        expect(document.querySelector('.separator')).toBeInTheDocument()
    })

    describe('ActionMenuSelectItem', () => {
        it('should throw an error if used outside of ActionMenuSelectGroup', () => {
            jest.spyOn(console, 'error').mockImplementationOnce(() => {})

            expect(() => {
                render(<ActionMenuSelectItem value="test" label="test" />)
            }).toThrow(
                'useActionMenuSelectGroup must be used within a ActionMenuSelectGroup',
            )
        })
    })
})
