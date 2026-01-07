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
        it('should render statuses from props', () => {
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

    describe('Description Display', () => {
        it('should status descriptions', () => {
            renderAgentStatusesTable()
            const descriptions = defaultProps.data.map(
                (status) => status.description,
            )

            let emptyDescriptionsCount = 0

            for (const description of descriptions) {
                if (!description) {
                    emptyDescriptionsCount++
                } else {
                    expect(screen.getByText(description)).toBeInTheDocument()
                }
            }
            expect(screen.getAllByText('—').length).toBe(emptyDescriptionsCount)
        })
    })

    describe('Duration Formatting', () => {
        it('should display special duration text for system statuses', () => {
            renderAgentStatusesTable()

            const durationDisplays = defaultProps.data
                .map((status) => status.durationDisplay)
                .filter((durationDisplay) => durationDisplay !== undefined)

            for (const durationDisplay of durationDisplays) {
                if (durationDisplay) {
                    expect(
                        screen.getByText(durationDisplay),
                    ).toBeInTheDocument()
                }
            }
        })

        it('should display "Unlimited" for null duration on custom statuses', () => {
            renderAgentStatusesTable()

            // Multiple statuses have unlimited duration
            const unlimitedElements = screen.getAllByText('Unlimited')
            expect(unlimitedElements.length).toBeGreaterThan(0)
        })

        it('should format minutes correctly', () => {
            renderAgentStatusesTable()

            expect(screen.getByText('30 minutes')).toBeInTheDocument()
        })

        it('should format hours correctly', () => {
            renderAgentStatusesTable()

            // Training is 2 hours
            expect(screen.getByText('2 hours')).toBeInTheDocument()
        })

        it('should format hours and minutes together', () => {
            const statusWithMixedDuration: AgentStatusWithSystem = {
                id: '5',
                name: 'Long meeting',
                duration_unit: 'minutes',
                duration_value: 90,
                is_system: false,
                created_datetime: '2024-01-05T00:00:00Z',
                updated_datetime: '2024-01-05T00:00:00Z',
                description: 'Long meeting status',
            }

            render(
                <AgentStatusesTable
                    {...defaultProps}
                    data={[...mockStatuses, statusWithMixedDuration]}
                />,
            )

            const longMeetingRow = screen
                .getByText('Long meeting')
                .closest('tr')!
            expect(
                within(longMeetingRow).getByText('1 hour 30 minutes'),
            ).toBeInTheDocument()
        })
    })

    describe('Action Buttons', () => {
        it('should have both edit and delete buttons for each row', () => {
            renderAgentStatusesTable()

            const allButtons = screen.getAllByRole('button')
            expect(allButtons.length).toBe(mockStatuses.length * 2)
        })

        it('should disable edit and delete buttons for system statuses', () => {
            renderAgentStatusesTable()

            const allButtons = screen.getAllByRole('button')
            const disabledButtons = allButtons.filter(
                (button) =>
                    button.hasAttribute('disabled') ||
                    button.getAttribute('aria-disabled') === 'true',
            )

            expect(disabledButtons.length).toBe(SYSTEM_STATUSES.length * 2)
        })

        it('should enable edit and delete buttons for custom statuses', () => {
            renderAgentStatusesTable()

            const allButtons = screen.getAllByRole('button')
            const enabledButtons = allButtons.filter(
                (button) =>
                    !button.hasAttribute('disabled') &&
                    button.getAttribute('aria-disabled') !== 'true',
            )

            expect(enabledButtons.length).toBe(mockCustomStatuses.length * 2)
        })

        it('should call onEdit with correct status when edit button clicked', async () => {
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

        it('should call onDelete with correct status id when delete button clicked', async () => {
            const onDelete = vi.fn()
            const { user } = render(
                <AgentStatusesTable {...defaultProps} onDelete={onDelete} />,
            )

            const lunchRow = screen.getByText('Lunch break').closest('tr')!
            const deleteButton = within(lunchRow).getByRole('button', {
                name: /delete lunch break status/i,
            })

            await act(() => user.click(deleteButton))

            expect(onDelete).toHaveBeenCalledWith(['2'])
            expect(onDelete).toHaveBeenCalledTimes(1)
        })

        it('should not call onEdit when clicking disabled edit button on system status', async () => {
            const onEdit = vi.fn()
            const { user } = render(
                <AgentStatusesTable {...defaultProps} onEdit={onEdit} />,
            )

            const unavailableRow = screen
                .getByText('Unavailable')
                .closest('tr')!
            const editButton = within(unavailableRow).getByRole('button', {
                name: /cannot edit system status unavailable/i,
            })

            expect(editButton).toBeDisabled()

            // Try to click anyway
            await act(() => user.click(editButton))

            // Callback should not be called
            expect(onEdit).not.toHaveBeenCalled()
        })

        it('should not call onDelete when clicking disabled delete button on system status', async () => {
            const onDelete = vi.fn()
            const { user } = render(
                <AgentStatusesTable {...defaultProps} onDelete={onDelete} />,
            )

            const unavailableRow = screen
                .getByText('Unavailable')
                .closest('tr')!
            const deleteButton = within(unavailableRow).getByRole('button', {
                name: /cannot delete system status unavailable/i,
            })

            expect(deleteButton).toBeDisabled()

            // Try to click anyway
            await act(() => user.click(deleteButton))

            // Callback should not be called
            expect(onDelete).not.toHaveBeenCalled()
        })
    })

    describe('Accessibility - Structure', () => {
        it('should have proper table structure', () => {
            renderAgentStatusesTable()

            const table = screen.getByRole('table')
            expect(table).toBeInTheDocument()

            // Should have column headers
            const columnHeaders = screen.getAllByRole('columnheader')
            expect(columnHeaders.length).toBe(4) // Status, Description, Duration, Actions

            // Should have rows
            const rows = screen.getAllByRole('row')
            expect(rows.length).toBeGreaterThan(1) // At least header + data rows
        })

        it('should have semantic column headers', () => {
            renderAgentStatusesTable()

            expect(
                screen.getByRole('columnheader', { name: /status/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: /description/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: /duration/i }),
            ).toBeInTheDocument()
        })

        it('should have proper row structure with cells', () => {
            renderAgentStatusesTable()

            const firstDataRow = screen.getAllByRole('row')[1] // Skip header row
            const cells = within(firstDataRow).getAllByRole('cell')

            expect(cells.length).toBe(4) // One cell per column
        })
    })

    describe('Accessibility - ARIA Attributes', () => {
        it('should have accessible names on all action buttons', () => {
            renderAgentStatusesTable()

            const allButtons = screen.getAllByRole('button')
            allButtons.forEach((button) => {
                expect(button).toHaveAccessibleName()
            })
        })

        it('should have descriptive aria-labels that include status names', () => {
            renderAgentStatusesTable()

            // Custom status - should have edit/delete labels with status name
            expect(
                screen.getByRole('button', { name: /edit available status/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', {
                    name: /delete available status/i,
                }),
            ).toBeInTheDocument()
        })

        it('should have aria-labels indicating disabled state for system statuses', () => {
            renderAgentStatusesTable()

            // System status - aria-label should indicate cannot edit/delete
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

        it('should maintain both disabled attribute and aria-disabled', () => {
            renderAgentStatusesTable()

            const systemStatusRow = screen
                .getByText('Unavailable')
                .closest('tr')!
            const editButton = within(systemStatusRow).getByRole('button', {
                name: /cannot edit/i,
            })

            expect(editButton).toHaveAttribute('aria-disabled', 'true')
            expect(editButton).toBeDisabled()
        })

        it('should have proper table accessibility attributes', () => {
            renderAgentStatusesTable()

            const table = screen.getByRole('table')
            expect(table).toBeInTheDocument()

            // Verify table has accessible name
            expect(table).toHaveAttribute(
                'aria-label',
                'Agent availability statuses',
            )
        })
    })
})
