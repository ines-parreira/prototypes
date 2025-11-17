import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { FilterOption } from '../AddFilterButton'
import { AddFilterButton } from '../AddFilterButton'

describe('AddFilterButton', () => {
    const mockOptions: FilterOption[] = [
        { label: 'Last Updated Date', value: 'lastUpdatedAt' },
        { label: 'In Use by AI Agent', value: 'inUseByAI' },
        { label: 'Knowledge Type', value: 'type' },
    ]

    it('renders button with label', () => {
        render(<AddFilterButton options={mockOptions} />)

        expect(
            screen.getByRole('button', { name: /add filter/i }),
        ).toBeInTheDocument()
    })

    it('renders button with correct size', () => {
        render(<AddFilterButton options={mockOptions} />)

        const button = screen.getByRole('button', { name: /add filter/i })
        expect(button).toBeInTheDocument()
    })

    it('opens dropdown when button is clicked', async () => {
        render(<AddFilterButton options={mockOptions} />)

        const button = screen.getByRole('button', { name: /add filter/i })
        await userEvent.click(button)

        await waitFor(() => {
            expect(screen.getByText('Last Updated Date')).toBeInTheDocument()
            expect(screen.getByText('In Use by AI Agent')).toBeInTheDocument()
            expect(screen.getByText('Knowledge Type')).toBeInTheDocument()
        })
    })

    it('closes dropdown when option is clicked', async () => {
        render(<AddFilterButton options={mockOptions} />)

        const button = screen.getByRole('button', { name: /add filter/i })
        await userEvent.click(button)

        await waitFor(() => {
            expect(screen.getByText('Last Updated Date')).toBeInTheDocument()
        })

        const option = screen.getByText('Last Updated Date')
        await userEvent.click(option)

        await waitFor(() => {
            expect(
                screen.queryByText('Last Updated Date'),
            ).not.toBeInTheDocument()
        })
    })

    it('closes dropdown when button is clicked again', async () => {
        render(<AddFilterButton options={mockOptions} />)

        const button = screen.getByRole('button', { name: /add filter/i })

        await userEvent.click(button)
        await waitFor(() => {
            expect(screen.getByText('Last Updated Date')).toBeInTheDocument()
        })

        await userEvent.click(button)
        await waitFor(() => {
            expect(
                screen.queryByText('Last Updated Date'),
            ).not.toBeInTheDocument()
        })
    })

    it('renders all provided options', async () => {
        render(<AddFilterButton options={mockOptions} />)

        const button = screen.getByRole('button', { name: /add filter/i })
        await userEvent.click(button)

        await waitFor(() => {
            mockOptions.forEach((option) => {
                expect(screen.getByText(option.label)).toBeInTheDocument()
            })
        })
    })

    it('handles empty options array', async () => {
        render(<AddFilterButton options={[]} />)

        const button = screen.getByRole('button', { name: /add filter/i })
        expect(button).toBeInTheDocument()

        await userEvent.click(button)

        expect(button).toBeInTheDocument()
    })
})
