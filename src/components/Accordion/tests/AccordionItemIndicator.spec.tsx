import { render, screen } from '@testing-library/react'

import { AccordionItem } from '../components/AccordionItem'
import { AccordionItemIndicator } from '../components/AccordionItemIndicator'
import { AccordionRoot } from '../components/AccordionRoot'
import { AccordionState } from '../utils/accordion-state'

jest.mock('../hooks/useAccordionItem', () => ({
    useAccordionItem: jest.fn(),
}))

const mockUseAccordionItem =
    require('../hooks/useAccordionItem').useAccordionItem

describe('AccordionItemIndicator', () => {
    const defaultItemProps = {
        isOpen: false,
    }

    beforeEach(() => {
        mockUseAccordionItem.mockReturnValue(defaultItemProps)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders with default props', () => {
        render(
            <AccordionRoot>
                <AccordionItem value="item1">
                    <AccordionItemIndicator>Indicator</AccordionItemIndicator>
                </AccordionItem>
            </AccordionRoot>,
        )

        const indicator = screen.getByText('Indicator')
        expect(indicator).toBeInTheDocument()
        expect(indicator).toHaveAttribute('data-state', AccordionState.Closed)
    })

    it('applies open state', () => {
        mockUseAccordionItem.mockReturnValue({
            ...defaultItemProps,
            isOpen: true,
        })

        render(
            <AccordionRoot>
                <AccordionItem value="item1">
                    <AccordionItemIndicator>Indicator</AccordionItemIndicator>
                </AccordionItem>
            </AccordionRoot>,
        )

        const indicator = screen.getByText('Indicator')
        expect(indicator).toHaveAttribute('data-state', AccordionState.Open)
    })

    it('applies custom className', () => {
        render(
            <AccordionRoot>
                <AccordionItem value="item1">
                    <AccordionItemIndicator className="custom-class">
                        Indicator
                    </AccordionItemIndicator>
                </AccordionItem>
            </AccordionRoot>,
        )

        const indicator = screen.getByText('Indicator')
        expect(indicator).toHaveClass('custom-class')
    })
})
