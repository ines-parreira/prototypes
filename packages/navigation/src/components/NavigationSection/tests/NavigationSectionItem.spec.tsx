import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { NavigationSectionItem } from '../NavigationSectionItem'

const renderInRouter = (ui: React.ReactNode) =>
    render(<MemoryRouter>{ui}</MemoryRouter>)

describe('NavigationSectionItem', () => {
    it('renders label text', () => {
        renderInRouter(
            <NavigationSectionItem to="/overview" label="Overview" />,
        )

        expect(screen.getByText('Overview')).toBeInTheDocument()
    })

    it('renders leading slot as icon when given an icon name', () => {
        renderInRouter(
            <NavigationSectionItem
                to="/overview"
                label="Overview"
                leadingSlot="chart-line"
            />,
        )

        expect(
            screen.getByRole('img', { name: 'chart-line' }),
        ).toBeInTheDocument()
    })

    it('renders leading slot as ReactNode when not an icon name', () => {
        renderInRouter(
            <NavigationSectionItem
                to="/overview"
                label="Overview"
                leadingSlot={<span>Custom</span>}
            />,
        )

        expect(screen.getByText('Custom')).toBeInTheDocument()
    })

    it('renders trailing slot as icon when given an icon name', () => {
        renderInRouter(
            <NavigationSectionItem
                to="/overview"
                label="Overview"
                trailingSlot="arrow-circle-up"
            />,
        )

        expect(
            screen.getByRole('img', { name: 'arrow-circle-up' }),
        ).toBeInTheDocument()
    })

    it('renders trailing slot as ReactNode when not an icon name', () => {
        renderInRouter(
            <NavigationSectionItem
                to="/overview"
                label="Overview"
                trailingSlot={<span>Beta</span>}
            />,
        )

        expect(screen.getByText('Beta')).toBeInTheDocument()
    })

    it('calls onClick handler when clicked', async () => {
        const user = userEvent.setup()
        const onClick = vi.fn()

        renderInRouter(
            <NavigationSectionItem
                to="/overview"
                label="Overview"
                onClick={onClick}
            />,
        )

        await user.click(screen.getByText('Overview'))

        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
