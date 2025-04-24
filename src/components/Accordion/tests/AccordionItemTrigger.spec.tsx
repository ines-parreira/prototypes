import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AccordionItem } from '../components/AccordionItem'
import { AccordionItemTrigger } from '../components/AccordionItemTrigger'
import { AccordionRoot } from '../components/AccordionRoot'
import { AccordionIds } from '../utils/accessibility-ids'
import { AccordionState } from '../utils/accordion-state'

jest.mock('../hooks/useAccordion', () => ({
    useAccordion: jest.fn(),
}))

jest.mock('../hooks/useAccordionItem', () => ({
    useAccordionItem: jest.fn(),
}))

const mockUseAccordion = require('../hooks/useAccordion').useAccordion
const mockUseAccordionItem =
    require('../hooks/useAccordionItem').useAccordionItem

describe('AccordionItemTrigger', () => {
    const defaultAccordionProps = {
        handleValueChange: jest.fn(),
        disabled: false,
        id: 'test-accordion',
        values: ['item1'],
    }

    const defaultItemProps = {
        isOpen: false,
        value: 'item1',
        disabled: false,
    }

    beforeEach(() => {
        mockUseAccordion.mockReturnValue(defaultAccordionProps)
        mockUseAccordionItem.mockReturnValue(defaultItemProps)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders with default props', () => {
        render(
            <AccordionRoot>
                <AccordionItem value="item1">
                    <AccordionItemTrigger>Trigger</AccordionItemTrigger>
                </AccordionItem>
            </AccordionRoot>,
        )

        const trigger = screen.getByRole('button')
        expect(trigger).toBeInTheDocument()
        expect(trigger).toHaveTextContent('Trigger')
        expect(trigger).toHaveAttribute('data-state', AccordionState.Closed)
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(trigger).toHaveAttribute(
            'id',
            AccordionIds.trigger('test-accordion', 'item1'),
        )
        expect(trigger).toHaveAttribute(
            'aria-controls',
            AccordionIds.content('test-accordion', 'item1'),
        )
    })

    it('handles click events', async () => {
        const handleValueChange = jest.fn()
        mockUseAccordion.mockReturnValue({
            ...defaultAccordionProps,
            handleValueChange,
        })

        render(
            <AccordionRoot>
                <AccordionItem value="item1">
                    <AccordionItemTrigger>Trigger</AccordionItemTrigger>
                </AccordionItem>
            </AccordionRoot>,
        )

        const trigger = screen.getByRole('button')
        await userEvent.click(trigger)

        expect(handleValueChange).toHaveBeenCalledWith('item1')
    })

    it('applies disabled state from root', () => {
        mockUseAccordion.mockReturnValue({
            ...defaultAccordionProps,
            disabled: true,
        })

        render(
            <AccordionRoot>
                <AccordionItem value="item1">
                    <AccordionItemTrigger>Trigger</AccordionItemTrigger>
                </AccordionItem>
            </AccordionRoot>,
        )

        const trigger = screen.getByRole('button')
        expect(trigger).toBeDisabled()
    })

    it('applies disabled state from item', () => {
        mockUseAccordionItem.mockReturnValue({
            ...defaultItemProps,
            disabled: true,
        })

        render(
            <AccordionRoot>
                <AccordionItem value="item1">
                    <AccordionItemTrigger>Trigger</AccordionItemTrigger>
                </AccordionItem>
            </AccordionRoot>,
        )

        const trigger = screen.getByRole('button')
        expect(trigger).toBeDisabled()
    })

    it('applies open state', () => {
        mockUseAccordionItem.mockReturnValue({
            ...defaultItemProps,
            isOpen: true,
        })

        render(
            <AccordionRoot>
                <AccordionItem value="item1">
                    <AccordionItemTrigger>Trigger</AccordionItemTrigger>
                </AccordionItem>
            </AccordionRoot>,
        )

        const trigger = screen.getByRole('button')
        expect(trigger).toHaveAttribute('data-state', AccordionState.Open)
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('applies custom className', () => {
        render(
            <AccordionRoot>
                <AccordionItem value="item1">
                    <AccordionItemTrigger className="custom-class">
                        Trigger
                    </AccordionItemTrigger>
                </AccordionItem>
            </AccordionRoot>,
        )

        const trigger = screen.getByRole('button')
        expect(trigger).toHaveClass('custom-class')
    })
})
