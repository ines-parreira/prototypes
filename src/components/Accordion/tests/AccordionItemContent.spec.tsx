import { render, screen } from '@testing-library/react'

import { AccordionItem } from '../components/AccordionItem'
import { AccordionItemContent } from '../components/AccordionItemContent'
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

describe('AccordionItemContent', () => {
    const defaultAccordionProps = {
        id: 'test-accordion',
        value: ['item1'],
    }

    const defaultItemProps = {
        isOpen: false,
        value: 'item1',
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
                    <AccordionItemContent>Content</AccordionItemContent>
                </AccordionItem>
            </AccordionRoot>,
        )

        const content = screen.getByRole('region')
        expect(content).toBeInTheDocument()
        expect(content).toHaveTextContent('Content')
        expect(content).toHaveAttribute('data-state', AccordionState.Closed)
        expect(content).toHaveAttribute(
            'id',
            AccordionIds.content('test-accordion', 'item1'),
        )
        expect(content).toHaveAttribute(
            'aria-labelledby',
            AccordionIds.trigger('test-accordion', 'item1'),
        )
    })

    it('applies open state', () => {
        mockUseAccordionItem.mockReturnValue({
            ...defaultItemProps,
            isOpen: true,
        })

        render(
            <AccordionRoot>
                <AccordionItem value="item1">
                    <AccordionItemContent>Content</AccordionItemContent>
                </AccordionItem>
            </AccordionRoot>,
        )

        const content = screen.getByRole('region')
        expect(content).toHaveAttribute('data-state', AccordionState.Open)
    })

    it('applies custom className', () => {
        render(
            <AccordionRoot>
                <AccordionItem value="item1">
                    <AccordionItemContent className="custom-class">
                        Content
                    </AccordionItemContent>
                </AccordionItem>
            </AccordionRoot>,
        )

        const content = screen.getByRole('region')
        expect(content).toHaveClass('custom-class')
    })
})
