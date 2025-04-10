import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Accordion } from '../Accordion'
import { AccordionState } from '../utils/accordion-state'

describe('Accordion Integration', () => {
    it('handles single item selection', async () => {
        render(
            <Accordion.Root multiple={false}>
                <Accordion.Item value="item1">
                    <Accordion.ItemTrigger>Trigger 1</Accordion.ItemTrigger>
                    <Accordion.ItemContent>Content 1</Accordion.ItemContent>
                </Accordion.Item>
                <Accordion.Item value="item2">
                    <Accordion.ItemTrigger>Trigger 2</Accordion.ItemTrigger>
                    <Accordion.ItemContent>Content 2</Accordion.ItemContent>
                </Accordion.Item>
            </Accordion.Root>,
        )

        expect(screen.getByText('Content 1')).toHaveAttribute(
            'data-state',
            AccordionState.Closed,
        )
        expect(screen.getByText('Content 2')).toHaveAttribute(
            'data-state',
            AccordionState.Closed,
        )

        await userEvent.click(screen.getByText('Trigger 1'))
        expect(screen.getByText('Content 1')).toHaveAttribute(
            'data-state',
            AccordionState.Open,
        )
        expect(screen.getByText('Content 2')).toHaveAttribute(
            'data-state',
            AccordionState.Closed,
        )

        await userEvent.click(screen.getByText('Trigger 2'))
        expect(screen.getByText('Content 1')).toHaveAttribute(
            'data-state',
            AccordionState.Closed,
        )
        expect(screen.getByText('Content 2')).toHaveAttribute(
            'data-state',
            AccordionState.Open,
        )
    })

    it('handles multiple item selection', async () => {
        render(
            <Accordion.Root multiple>
                <Accordion.Item value="item1">
                    <Accordion.ItemTrigger>Trigger 1</Accordion.ItemTrigger>
                    <Accordion.ItemContent>Content 1</Accordion.ItemContent>
                </Accordion.Item>
                <Accordion.Item value="item2">
                    <Accordion.ItemTrigger>Trigger 2</Accordion.ItemTrigger>
                    <Accordion.ItemContent>Content 2</Accordion.ItemContent>
                </Accordion.Item>
            </Accordion.Root>,
        )

        expect(screen.getByText('Content 1')).toHaveAttribute(
            'data-state',
            AccordionState.Closed,
        )
        expect(screen.getByText('Content 2')).toHaveAttribute(
            'data-state',
            AccordionState.Closed,
        )

        await userEvent.click(screen.getByText('Trigger 1'))
        expect(screen.getByText('Content 1')).toHaveAttribute(
            'data-state',
            AccordionState.Open,
        )
        expect(screen.getByText('Content 2')).toHaveAttribute(
            'data-state',
            AccordionState.Closed,
        )

        await userEvent.click(screen.getByText('Trigger 2'))
        expect(screen.getByText('Content 1')).toHaveAttribute(
            'data-state',
            AccordionState.Open,
        )
        expect(screen.getByText('Content 2')).toHaveAttribute(
            'data-state',
            AccordionState.Open,
        )

        await userEvent.click(screen.getByText('Trigger 1'))
        expect(screen.getByText('Content 1')).toHaveAttribute(
            'data-state',
            AccordionState.Closed,
        )
        expect(screen.getByText('Content 2')).toHaveAttribute(
            'data-state',
            AccordionState.Open,
        )
    })

    it('handles disabled state', async () => {
        render(
            <Accordion.Root disabled>
                <Accordion.Item value="item1">
                    <Accordion.ItemTrigger>Trigger 1</Accordion.ItemTrigger>
                    <Accordion.ItemContent>Content 1</Accordion.ItemContent>
                </Accordion.Item>
                <Accordion.Item value="item2" disabled>
                    <Accordion.ItemTrigger>Trigger 2</Accordion.ItemTrigger>
                    <Accordion.ItemContent>Content 2</Accordion.ItemContent>
                </Accordion.Item>
            </Accordion.Root>,
        )

        expect(screen.getByText('Trigger 1')).toBeDisabled()
        expect(screen.getByText('Trigger 2')).toBeDisabled()

        await userEvent.click(screen.getByText('Trigger 1'))
        expect(screen.getByText('Content 1')).toHaveAttribute(
            'data-state',
            AccordionState.Closed,
        )

        await userEvent.click(screen.getByText('Trigger 2'))
        expect(screen.getByText('Content 2')).toHaveAttribute(
            'data-state',
            AccordionState.Closed,
        )
    })

    it('handles controlled state', async () => {
        const onValueChange = jest.fn()
        render(
            <Accordion.Root value={['item1']} onValueChange={onValueChange}>
                <Accordion.Item value="item1">
                    <Accordion.ItemTrigger>Trigger 1</Accordion.ItemTrigger>
                    <Accordion.ItemContent>Content 1</Accordion.ItemContent>
                </Accordion.Item>
                <Accordion.Item value="item2">
                    <Accordion.ItemTrigger>Trigger 2</Accordion.ItemTrigger>
                    <Accordion.ItemContent>Content 2</Accordion.ItemContent>
                </Accordion.Item>
            </Accordion.Root>,
        )

        expect(screen.getByText('Content 1')).toHaveAttribute(
            'data-state',
            AccordionState.Open,
        )
        expect(screen.getByText('Content 2')).toHaveAttribute(
            'data-state',
            AccordionState.Closed,
        )

        await userEvent.click(screen.getByText('Trigger 1'))
        expect(onValueChange).toHaveBeenCalledWith([])

        await userEvent.click(screen.getByText('Trigger 2'))
        expect(onValueChange).toHaveBeenCalledWith(['item2'])
    })

    it('handles indicators and accessibility', () => {
        render(
            <Accordion.Root>
                <Accordion.Item value="item1">
                    <Accordion.ItemTrigger>
                        Trigger 1
                        <Accordion.ItemIndicator>▼</Accordion.ItemIndicator>
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>Content 1</Accordion.ItemContent>
                </Accordion.Item>
            </Accordion.Root>,
        )

        const trigger = screen.getByText('Trigger 1')
        const content = screen.getByText('Content 1')
        const indicator = screen.getByText('▼')

        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(trigger).toHaveAttribute('aria-controls')
        expect(content).toHaveAttribute('aria-labelledby')
        expect(content).toHaveAttribute('role', 'region')

        expect(indicator).toHaveAttribute('data-state', AccordionState.Closed)
    })
})
