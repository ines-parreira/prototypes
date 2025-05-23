import { render, screen } from '@testing-library/react'

import { AccordionState } from 'components/Accordion/utils/accordion-state'
import { userEvent } from 'utils/testing/userEvent'

import { Navigation } from '../Navigation'

jest.mock('components/Accordion/hooks/useAccordion', () => ({
    useAccordion: jest.fn(),
}))

jest.mock('components/Accordion/hooks/useAccordionItem', () => ({
    useAccordionItem: jest.fn(),
}))

const mockUseAccordion =
    require('components/Accordion/hooks/useAccordion').useAccordion
const mockUseAccordionItem =
    require('components/Accordion/hooks/useAccordionItem').useAccordionItem

describe('AccordionItemTrigger', () => {
    const defaultAccordionProps = {
        handleValueChange: jest.fn(),
        disabled: false,
        id: 'test-accordion',
        values: ['section1'],
    }

    const defaultItemProps = {
        isOpen: false,
        value: 'section1',
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
            <Navigation.Root>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger>
                        Trigger
                    </Navigation.SectionTrigger>
                </Navigation.Section>
            </Navigation.Root>,
        )

        const trigger = screen.getByRole('button')
        expect(trigger).toBeInTheDocument()
        expect(trigger).toHaveTextContent('Trigger')
        expect(trigger).toHaveAttribute('data-state', AccordionState.Closed)
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('handles click events', async () => {
        const handleValueChange = jest.fn()
        mockUseAccordion.mockReturnValue({
            ...defaultAccordionProps,
            handleValueChange,
        })

        render(
            <Navigation.Root>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger>
                        Trigger
                    </Navigation.SectionTrigger>
                </Navigation.Section>
            </Navigation.Root>,
        )

        const trigger = screen.getByRole('button')
        await userEvent.click(trigger)

        expect(handleValueChange).toHaveBeenCalledWith('section1')
    })

    it('applies disabled state from root', () => {
        mockUseAccordion.mockReturnValue({
            ...defaultAccordionProps,
            disabled: true,
        })

        render(
            <Navigation.Root>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger>
                        Trigger
                    </Navigation.SectionTrigger>
                </Navigation.Section>
            </Navigation.Root>,
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
            <Navigation.Root>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger>
                        Trigger
                    </Navigation.SectionTrigger>
                </Navigation.Section>
            </Navigation.Root>,
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
            <Navigation.Root>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger>
                        Trigger
                    </Navigation.SectionTrigger>
                </Navigation.Section>
            </Navigation.Root>,
        )

        const trigger = screen.getByRole('button')
        expect(trigger).toHaveAttribute('data-state', AccordionState.Open)
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('applies custom className', () => {
        render(
            <Navigation.Root>
                <Navigation.Section value="section1">
                    <Navigation.SectionTrigger className="custom-class">
                        Trigger
                    </Navigation.SectionTrigger>
                </Navigation.Section>
            </Navigation.Root>,
        )

        const trigger = screen.getByRole('button')
        expect(trigger).toHaveClass('custom-class')
    })
})
