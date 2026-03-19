import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { NavigationSection } from '../NavigationSection'

const renderInRouter = (ui: React.ReactNode) =>
    render(<MemoryRouter>{ui}</MemoryRouter>)

describe('NavigationSection', () => {
    describe('link variant', () => {
        it('renders label text', () => {
            renderInRouter(
                <NavigationSection to="/settings" label="Settings" />,
            )

            expect(screen.getByText('Settings')).toBeInTheDocument()
        })

        it('renders leading slot as icon when given an icon name', () => {
            renderInRouter(
                <NavigationSection
                    to="/settings"
                    label="Settings"
                    leadingSlot="chart-line"
                />,
            )

            expect(
                screen.getByRole('img', { name: 'chart-line' }),
            ).toBeInTheDocument()
        })

        it('renders leading slot as ReactNode when not an icon name', () => {
            renderInRouter(
                <NavigationSection
                    to="/settings"
                    label="Settings"
                    leadingSlot={<span>Custom Icon</span>}
                />,
            )

            expect(screen.getByText('Custom Icon')).toBeInTheDocument()
        })

        it('renders with data-candu-id attribute when canduId is provided', () => {
            const { container } = renderInRouter(
                <NavigationSection
                    to="/settings"
                    label="Settings"
                    canduId="link-candu-id"
                />,
            )

            expect(
                container.querySelector('[data-candu-id="link-candu-id"]'),
            ).toBeInTheDocument()
        })
    })

    describe('collapsible variant', () => {
        it('renders label', () => {
            renderInRouter(
                <NavigationSection label="Tools">
                    <div>Child</div>
                </NavigationSection>,
            )

            expect(screen.getByText('Tools')).toBeInTheDocument()
        })

        it('expands and shows children when header is clicked', async () => {
            const user = userEvent.setup()
            renderInRouter(
                <NavigationSection label="Tools">
                    <div>Child Item</div>
                </NavigationSection>,
            )

            await user.click(screen.getByText('Tools'))

            expect(screen.getByText('Child Item')).toBeInTheDocument()
        })

        it('renders actionsSlot in header', () => {
            renderInRouter(
                <NavigationSection
                    label="Dashboards"
                    actionsSlot={<button>Add Dashboard</button>}
                >
                    <div>Child</div>
                </NavigationSection>,
            )

            expect(
                screen.getByRole('button', { name: 'Add Dashboard' }),
            ).toBeInTheDocument()
        })

        it('renders trailingSlot as ReactNode when not an icon name', () => {
            renderInRouter(
                <NavigationSection
                    label="Tools"
                    trailingSlot={<span>Beta</span>}
                >
                    <div>Child</div>
                </NavigationSection>,
            )

            expect(screen.getByText('Beta')).toBeInTheDocument()
        })

        it('renders trailingSlot as icon when given an icon name', () => {
            renderInRouter(
                <NavigationSection label="Tools" trailingSlot="arrow-circle-up">
                    <div>Child</div>
                </NavigationSection>,
            )

            expect(
                screen.getByRole('img', { name: 'arrow-circle-up' }),
            ).toBeInTheDocument()
        })

        it('renders with data-candu-id attribute when canduId is provided', () => {
            const { container } = renderInRouter(
                <NavigationSection label="Tools" canduId="my-candu-id">
                    <div>Child</div>
                </NavigationSection>,
            )

            expect(
                container.querySelector('[data-candu-id="my-candu-id"]'),
            ).toBeInTheDocument()
        })
    })
})
