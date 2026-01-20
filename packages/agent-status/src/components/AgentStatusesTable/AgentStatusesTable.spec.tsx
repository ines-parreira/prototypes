import { act, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CustomUserAvailabilityStatus } from '@gorgias/helpdesk-queries'

import { SYSTEM_STATUSES } from '../../constants'
import { render } from '../../tests/render.utils'
import type { AgentStatusWithSystem } from '../../types'
import { AgentStatusesTable } from './AgentStatusesTable'

const mockCustomStatuses: (CustomUserAvailabilityStatus & {
    description: string
})[] = [
    {
        id: '1',
        name: 'Available',
        duration_unit: null,
        duration_value: null,
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-01T00:00:00Z',
        description: 'Available status',
    },
    {
        id: '2',
        name: 'Lunch break',
        duration_unit: 'minutes',
        duration_value: 30,
        created_datetime: '2024-01-02T00:00:00Z',
        updated_datetime: '2024-01-02T00:00:00Z',
        description: 'Lunch break status',
    },
    {
        id: '3',
        name: 'Meeting',
        duration_unit: null,
        duration_value: null,
        created_datetime: '2024-01-03T00:00:00Z',
        updated_datetime: '2024-01-03T00:00:00Z',
        description: 'Meeting status',
    },
    {
        id: '4',
        name: 'Training',
        duration_unit: 'hours',
        duration_value: 2,
        created_datetime: '2024-01-04T00:00:00Z',
        updated_datetime: '2024-01-04T00:00:00Z',
        description: '',
    },
]

const mockStatuses: AgentStatusWithSystem[] = [
    ...SYSTEM_STATUSES,
    ...mockCustomStatuses.map((status) => ({
        ...status,
        is_system: false,
    })),
]

describe('AgentStatusesTable', () => {
    const defaultProps = {
        data: mockStatuses,
        onEdit: vi.fn(),
        onDelete: vi.fn(),
    }

    const renderAgentStatusesTable = (props?: typeof defaultProps) => {
        return render(<AgentStatusesTable {...defaultProps} {...props} />)
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Rendering', () => {
        it('should render all statuses', () => {
            renderAgentStatusesTable()

            const statuses = defaultProps.data.map((status) => status.name)

            for (const status of statuses) {
                expect(screen.getByText(status)).toBeInTheDocument()
            }
        })

        it('should render table headers', () => {
            renderAgentStatusesTable()

            expect(screen.getByText('Status')).toBeInTheDocument()
            expect(screen.getByText('Description')).toBeInTheDocument()
            expect(screen.getByText('Duration')).toBeInTheDocument()
        })
    })

    describe('Description display', () => {
        it('should show description or "—" for empty', () => {
            renderAgentStatusesTable()

            expect(screen.getByText('Available status')).toBeInTheDocument()
            expect(screen.getByText('Lunch break status')).toBeInTheDocument()

            // Training has empty description
            const trainingRow = screen.getByText('Training').closest('tr')!
            expect(within(trainingRow).getByText('—')).toBeInTheDocument()
        })
    })

    describe('Duration formatting', () => {
        it('should format unlimited as "Unlimited"', () => {
            renderAgentStatusesTable()

            expect(screen.getAllByText('Unlimited').length).toBeGreaterThan(0)
        })

        it('should format durations correctly', () => {
            renderAgentStatusesTable()

            expect(screen.getByText('30 minutes')).toBeInTheDocument()
            expect(screen.getByText('2 hours')).toBeInTheDocument()
        })
    })

    describe('Action buttons', () => {
        it('should have edit and delete buttons for each row', () => {
            renderAgentStatusesTable()

            const allButtons = screen.getAllByRole('button')
            expect(allButtons.length).toBe(mockStatuses.length * 2)
        })

        it('should disable buttons for system statuses', () => {
            renderAgentStatusesTable()

            const allButtons = screen.getAllByRole('button')
            const disabledButtons = allButtons.filter(
                (button) =>
                    button.hasAttribute('disabled') ||
                    button.getAttribute('aria-disabled') === 'true',
            )

            expect(disabledButtons.length).toBe(SYSTEM_STATUSES.length * 2)
        })

        it('should enable buttons for custom statuses', () => {
            renderAgentStatusesTable()

            const allButtons = screen.getAllByRole('button')
            const enabledButtons = allButtons.filter(
                (button) =>
                    !button.hasAttribute('disabled') &&
                    button.getAttribute('aria-disabled') !== 'true',
            )

            expect(enabledButtons.length).toBe(mockCustomStatuses.length * 2)
        })

        it('should call onEdit when edit button clicked', async () => {
            const onEdit = vi.fn()
            const { user } = render(
                <AgentStatusesTable {...defaultProps} onEdit={onEdit} />,
            )

            const lunchRow = screen.getByText('Lunch break').closest('tr')!
            const editButton = within(lunchRow).getByRole('button', {
                name: /edit lunch break status/i,
            })

            await act(() => user.click(editButton))

            expect(onEdit).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: '2',
                    name: 'Lunch break',
                }),
            )
            expect(onEdit).toHaveBeenCalledTimes(1)
        })

        it('should call onDelete when delete button clicked', async () => {
            const onDelete = vi.fn()
            const { user } = render(
                <AgentStatusesTable {...defaultProps} onDelete={onDelete} />,
            )

            const lunchRow = screen.getByText('Lunch break').closest('tr')!
            const deleteButton = within(lunchRow).getByRole('button', {
                name: /delete lunch break status/i,
            })

            await act(() => user.click(deleteButton))

            expect(onDelete).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: '2',
                    name: 'Lunch break',
                }),
            )
            expect(onDelete).toHaveBeenCalledTimes(1)
        })
    })

    describe('Accessibility', () => {
        it('should have proper table structure with semantic headers', () => {
            renderAgentStatusesTable()

            const table = screen.getByRole('table')
            expect(table).toBeInTheDocument()

            // Should have column headers
            expect(
                screen.getByRole('columnheader', { name: /status/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: /description/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: /duration/i }),
            ).toBeInTheDocument()

            // Should have rows with cells
            const firstDataRow = screen.getAllByRole('row')[1]
            const cells = within(firstDataRow).getAllByRole('cell')
            expect(cells.length).toBe(4)
        })

        it('should have accessible button labels', () => {
            renderAgentStatusesTable()

            // Custom status buttons
            expect(
                screen.getByRole('button', { name: /edit available status/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', {
                    name: /delete available status/i,
                }),
            ).toBeInTheDocument()

            // System status buttons with disabled indication
            expect(
                screen.getByRole('button', {
                    name: /cannot edit system status unavailable/i,
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', {
                    name: /cannot delete system status unavailable/i,
                }),
            ).toBeInTheDocument()
        })
    })
})
