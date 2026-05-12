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
                trailingSlot="arrow-up-circle"
            />,
        )

        expect(
            screen.getByRole('img', { name: 'arrow-up-circle' }),
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

    it('renders with data-candu-id attribute when canduId is provided', () => {
        const { container } = renderInRouter(
            <NavigationSectionItem
                to="/overview"
                label="Overview"
                canduId="item-candu-id"
            />,
        )

        expect(
            container.querySelector('[data-candu-id="item-candu-id"]'),
        ).toBeInTheDocument()
    })

    it('renders trailing slot function with isActive=true when route matches', () => {
        render(
            <MemoryRouter initialEntries={['/overview']}>
                <NavigationSectionItem
                    to="/overview"
                    label="Overview"
                    trailingSlot={({ isActive }) => (
                        <span>
                            {isActive ? 'active-slot' : 'inactive-slot'}
                        </span>
                    )}
                />
            </MemoryRouter>,
        )

        expect(screen.getByText('active-slot')).toBeInTheDocument()
    })

    it('renders trailing slot function with isActive=false when route does not match', () => {
        renderInRouter(
            <NavigationSectionItem
                to="/overview"
                label="Overview"
                trailingSlot={({ isActive }) => (
                    <span>{isActive ? 'active-slot' : 'inactive-slot'}</span>
                )}
            />,
        )

        expect(screen.getByText('inactive-slot')).toBeInTheDocument()
    })
})
