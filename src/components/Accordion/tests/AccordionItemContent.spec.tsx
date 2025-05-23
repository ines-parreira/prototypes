import { render, screen } from '@testing-library/react'

import { userEvent } from 'utils/testing/userEvent'

import { AccordionItem } from '../components/AccordionItem'
import { AccordionItemContent } from '../components/AccordionItemContent'
import { AccordionItemTrigger } from '../components/AccordionItemTrigger'
import { AccordionRoot } from '../components/AccordionRoot'
import { AccordionIds } from '../utils/accessibility-ids'

describe('AccordionItemContent', () => {
    it('renders with default props', () => {
        render(
            <AccordionRoot value={['item1']} id="test-accordion">
                <AccordionItem value="item1">
                    <AccordionItemContent>Content</AccordionItemContent>
                </AccordionItem>
            </AccordionRoot>,
        )

        const content = screen.getByRole('region')
        expect(content).toBeInTheDocument()
        expect(content).toHaveTextContent('Content')
        expect(content).toHaveAttribute('aria-hidden', 'false')
        expect(content).toHaveAttribute(
            'id',
            AccordionIds.content('test-accordion', 'item1'),
        )
        expect(content).toHaveAttribute(
            'aria-labelledby',
            AccordionIds.trigger('test-accordion', 'item1'),
        )
    })

    it('applies open state', async () => {
        render(
            <AccordionRoot id="test-accordion">
                <AccordionItem value="item1">
                    <AccordionItemTrigger>Trigger</AccordionItemTrigger>
                    <AccordionItemContent>Content</AccordionItemContent>
                </AccordionItem>
            </AccordionRoot>,
        )

        const trigger = screen.getByRole('button', { name: 'Trigger' })

        await userEvent.click(trigger)

        const content = screen.getByRole('region')
        expect(content).toHaveAttribute('aria-hidden', 'false')
    })

    it('applies custom className', () => {
        render(
            <AccordionRoot value={['item1']}>
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
