import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'

import type { FilterOption } from '../AddFilterButton'
import { AddFilterButton } from '../AddFilterButton'

describe('AddFilterButton', () => {
    const mockOptions: FilterOption[] = [
        { label: 'Last Updated Date', value: 'lastUpdatedAt' },
        { label: 'In Use by AI Agent', value: 'inUseByAI' },
        { label: 'Knowledge Type', value: 'type' },
    ]
    const mockOnOptionSelect = jest.fn()

    const renderComponent = (options: FilterOption[] = mockOptions) => {
        return render(
            <ThemeProvider>
                <AddFilterButton
                    options={options}
                    onOptionSelect={mockOnOptionSelect}
                />
            </ThemeProvider>,
        )
    }

    beforeEach(() => {
        mockOnOptionSelect.mockClear()
    })

    describe('Button rendering', () => {
        it('renders button with correct label', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /add filter/i }),
            ).toBeInTheDocument()
        })

        it('has correct data-candu-id attribute', () => {
            renderComponent()

            const button = screen.getByRole('button', { name: /add filter/i })
            expect(button).toHaveAttribute(
                'data-candu-id',
                'knowledge-hub-add-filter',
            )
        })
    })

    describe('Menu interactions', () => {
        it('opens menu when button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const button = screen.getByRole('button', { name: /add filter/i })
            await user.click(button)

            await waitFor(() => {
                expect(
                    screen.getByRole('menuitem', { name: 'Last Updated Date' }),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('menuitem', {
                        name: 'In Use by AI Agent',
                    }),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('menuitem', { name: 'Knowledge Type' }),
                ).toBeInTheDocument()
            })
        })

        it('closes menu when button is clicked again', async () => {
            const user = userEvent.setup()
            renderComponent()

            const button = screen.getByRole('button', { name: /add filter/i })

            await user.click(button)
            await waitFor(() => {
                expect(
                    screen.getByRole('menuitem', { name: 'Last Updated Date' }),
                ).toBeInTheDocument()
            })

            await user.click(button)
            await waitFor(() => {
                expect(
                    screen.queryByRole('menuitem', {
                        name: 'Last Updated Date',
                    }),
                ).not.toBeInTheDocument()
            })
        })

        it('closes menu and calls onOptionSelect when an option is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            const button = screen.getByRole('button', { name: /add filter/i })
            await user.click(button)

            await waitFor(() => {
                expect(
                    screen.getByRole('menuitem', { name: 'Last Updated Date' }),
                ).toBeInTheDocument()
            })

            const menuItem = screen.getByRole('menuitem', {
                name: 'Last Updated Date',
            })
            await user.click(menuItem)

            expect(mockOnOptionSelect).toHaveBeenCalledWith('lastUpdatedAt')
            expect(mockOnOptionSelect).toHaveBeenCalledTimes(1)

            await waitFor(() => {
                expect(
                    screen.queryByRole('menuitem', {
                        name: 'Last Updated Date',
                    }),
                ).not.toBeInTheDocument()
            })
        })

        it('renders all provided options in the menu', async () => {
            const user = userEvent.setup()
            renderComponent()

            const button = screen.getByRole('button', { name: /add filter/i })
            await user.click(button)

            await waitFor(() => {
                mockOptions.forEach((option) => {
                    expect(
                        screen.getByRole('menuitem', { name: option.label }),
                    ).toBeInTheDocument()
                })
            })
        })

        it('calls onOptionSelect with correct value for each option', async () => {
            const user = userEvent.setup()
            renderComponent()

            const button = screen.getByRole('button', { name: /add filter/i })

            for (const option of mockOptions) {
                await user.click(button)

                await waitFor(() => {
                    expect(
                        screen.getByRole('menuitem', { name: option.label }),
                    ).toBeInTheDocument()
                })

                const menuItem = screen.getByRole('menuitem', {
                    name: option.label,
                })
                await user.click(menuItem)

                expect(mockOnOptionSelect).toHaveBeenCalledWith(option.value)
                mockOnOptionSelect.mockClear()
            }
        })
    })

    describe('Edge cases', () => {
        it('handles empty options array gracefully', async () => {
            const user = userEvent.setup()
            renderComponent([])

            const button = screen.getByRole('button', { name: /add filter/i })
            expect(button).toBeInTheDocument()

            await user.click(button)

            expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
        })

        it('handles single option correctly', async () => {
            const user = userEvent.setup()
            const singleOption: FilterOption[] = [
                { label: 'Single Option', value: 'single' },
            ]
            renderComponent(singleOption)

            const button = screen.getByRole('button', { name: /add filter/i })
            await user.click(button)

            await waitFor(() => {
                expect(
                    screen.getByRole('menuitem', { name: 'Single Option' }),
                ).toBeInTheDocument()
            })

            const menuItem = screen.getByRole('menuitem', {
                name: 'Single Option',
            })
            await user.click(menuItem)

            expect(mockOnOptionSelect).toHaveBeenCalledWith('single')
        })
    })
})
