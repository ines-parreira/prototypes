import { render, screen } from '@testing-library/react'
import userEventLib from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { ShowMoreList } from './ShowMoreList'

describe('ShowMoreList', () => {
    const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6']

    it('should render all items when count is equal to threshold', () => {
        render(
            <ShowMoreList>
                {items.slice(0, 4).map((item) => (
                    <div key={item}>{item}</div>
                ))}
            </ShowMoreList>,
        )

        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 4')).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /show \d+ more/i }),
        ).not.toBeInTheDocument()
    })

    it('should render all items when count is less than threshold', () => {
        render(
            <ShowMoreList>
                {items.slice(0, 2).map((item) => (
                    <div key={item}>{item}</div>
                ))}
            </ShowMoreList>,
        )

        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 2')).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /show \d+ more/i }),
        ).not.toBeInTheDocument()
    })

    it('should show button when items exceed threshold', () => {
        render(
            <ShowMoreList>
                {items.map((item) => (
                    <div key={item}>{item}</div>
                ))}
            </ShowMoreList>,
        )

        expect(
            screen.getByRole('button', { name: /show 2 more/i }),
        ).toBeInTheDocument()
    })

    it('should show only threshold items initially', () => {
        render(
            <ShowMoreList>
                {items.map((item) => (
                    <div key={item}>{item}</div>
                ))}
            </ShowMoreList>,
        )

        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 4')).toBeInTheDocument()
        expect(screen.queryByText('Item 5')).not.toBeInTheDocument()
        expect(screen.queryByText('Item 6')).not.toBeInTheDocument()
    })

    it('should expand to show all items when button is clicked', async () => {
        const user = userEventLib.setup()
        render(
            <ShowMoreList>
                {items.map((item) => (
                    <div key={item}>{item}</div>
                ))}
            </ShowMoreList>,
        )

        const button = screen.getByRole('button', { name: /show 2 more/i })
        await user.click(button)

        expect(screen.getByText('Item 5')).toBeInTheDocument()
        expect(screen.getByText('Item 6')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /show less/i }),
        ).toBeInTheDocument()
    })

    it('should collapse back when show less is clicked', async () => {
        const user = userEventLib.setup()
        render(
            <ShowMoreList>
                {items.map((item) => (
                    <div key={item}>{item}</div>
                ))}
            </ShowMoreList>,
        )

        const showMoreButton = screen.getByRole('button', {
            name: /show 2 more/i,
        })
        await user.click(showMoreButton)

        const showLessButton = screen.getByRole('button', {
            name: /show less/i,
        })
        await user.click(showLessButton)

        expect(screen.queryByText('Item 5')).not.toBeInTheDocument()
        expect(screen.queryByText('Item 6')).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /show 2 more/i }),
        ).toBeInTheDocument()
    })

    it('should respect custom threshold', () => {
        render(
            <ShowMoreList threshold={2}>
                {items.map((item) => (
                    <div key={item}>{item}</div>
                ))}
            </ShowMoreList>,
        )

        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 2')).toBeInTheDocument()
        expect(screen.queryByText('Item 3')).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /show 4 more/i }),
        ).toBeInTheDocument()
    })

    it('should apply custom container className', () => {
        const { container } = render(
            <ShowMoreList containerClassName="custom-class">
                {items.map((item) => (
                    <div key={item}>{item}</div>
                ))}
            </ShowMoreList>,
        )

        expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('should have correct aria attributes for accessibility', async () => {
        const user = userEventLib.setup()
        render(
            <ShowMoreList>
                {items.map((item) => (
                    <div key={item}>{item}</div>
                ))}
            </ShowMoreList>,
        )

        const button = screen.getByRole('button', { name: /show 2 more/i })
        expect(button).toHaveAttribute('aria-expanded', 'false')

        await user.click(button)

        const expandedButton = screen.getByRole('button', {
            name: /show less/i,
        })
        expect(expandedButton).toHaveAttribute('aria-expanded', 'true')
    })
})
