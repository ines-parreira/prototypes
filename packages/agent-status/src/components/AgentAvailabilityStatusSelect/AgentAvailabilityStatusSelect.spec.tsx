import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockCustomUserAvailabilityStatus } from '@gorgias/helpdesk-mocks'
import type { CustomUserAvailabilityStatus } from '@gorgias/helpdesk-queries'

import { AVAILABLE_STATUS, UNAVAILABLE_STATUS } from '../../constants'
import * as hooks from '../../hooks'
import { render } from '../../tests/render.utils'
import type { AgentStatusWithSystem } from '../../types'
import { AgentAvailabilityStatusSelect } from './AgentAvailabilityStatusSelect'

vi.mock('../../hooks', async () => {
    const actual = await vi.importActual<typeof hooks>('../../hooks')
    return {
        ...actual,
        useSelectableAgentAvailabilityStatuses: vi.fn(),
    }
})

const mockCustomStatuses: CustomUserAvailabilityStatus[] = [
    mockCustomUserAvailabilityStatus({
        id: '1',
        name: 'Lunch break',
        description: 'Taking a lunch break',
        duration_unit: 'minutes',
        duration_value: 30,
    }),
    mockCustomUserAvailabilityStatus({
        id: '2',
        name: 'Meeting',
        description: 'In a meeting',
        duration_unit: 'hours',
        duration_value: 1,
    }),
]

function mockUseSelectableAgentAvailabilityStatuses(
    customStatuses: CustomUserAvailabilityStatus[] = mockCustomStatuses,
    options?: { isLoading?: boolean; isError?: boolean },
) {
    // Map custom statuses to include is_system: false, matching the hook's behavior
    const customStatusesWithSystem: AgentStatusWithSystem[] =
        customStatuses.map((status) => ({
            ...status,
            is_system: false,
        }))

    const allStatuses = [
        AVAILABLE_STATUS,
        UNAVAILABLE_STATUS,
        ...customStatusesWithSystem,
    ]

    vi.mocked(hooks.useSelectableAgentAvailabilityStatuses).mockReturnValue({
        allStatuses,
        isLoading: options?.isLoading ?? false,
        isError: options?.isError ?? false,
    } as any)
}

describe('AgentAvailabilityStatusSelect', () => {
    const defaultProps = {
        activeAvailabilityStatus: AVAILABLE_STATUS,
        onSelect: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockUseSelectableAgentAvailabilityStatuses()
    })

    describe('Basic rendering', () => {
        it('should render the select with default trigger', () => {
            render(<AgentAvailabilityStatusSelect {...defaultProps} />)

            expect(
                screen.getByRole('button', { name: /Available/i }),
            ).toBeInTheDocument()
        })

        it('should display selected status with available', () => {
            render(<AgentAvailabilityStatusSelect {...defaultProps} />)

            const badge = screen.getByRole('button', { name: /Available/i })
            expect(badge).toBeInTheDocument()
        })

        it('should display selected status with unavailable', () => {
            render(
                <AgentAvailabilityStatusSelect
                    {...defaultProps}
                    activeAvailabilityStatus={UNAVAILABLE_STATUS}
                />,
            )

            const badge = screen.getByRole('button', { name: /Unavailable/i })
            expect(badge).toBeInTheDocument()
        })

        it('should display custom status', () => {
            render(
                <AgentAvailabilityStatusSelect
                    {...defaultProps}
                    activeAvailabilityStatus={{
                        ...mockCustomStatuses[0],
                        is_system: false,
                    }}
                />,
            )

            const badge = screen.getByRole('button', { name: /Lunch break/i })
            expect(badge).toBeInTheDocument()
        })

        it('should render trigger button when no status selected', () => {
            render(
                <AgentAvailabilityStatusSelect
                    {...defaultProps}
                    activeAvailabilityStatus={undefined}
                    placeholder="Choose status"
                />,
            )

            const trigger = screen.getByRole('button')
            expect(trigger).toBeInTheDocument()
        })

        it('should render with default placeholder when not provided', () => {
            render(
                <AgentAvailabilityStatusSelect
                    {...defaultProps}
                    activeAvailabilityStatus={undefined}
                />,
            )

            const trigger = screen.getByText('Select status')
            expect(trigger).toBeInTheDocument()
        })
    })

    describe('Dropdown interaction', () => {
        it('should display all selectable statuses in dropdown', async () => {
            const { user } = render(
                <AgentAvailabilityStatusSelect {...defaultProps} />,
            )

            const trigger = screen.getByRole('button', { name: /Available/i })
            await user.click(trigger)

            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options.length).toBe(4)
            })
        })

        it('should call onSelect with selected status when option is clicked', async () => {
            const onSelect = vi.fn()
            const { user } = render(
                <AgentAvailabilityStatusSelect
                    {...defaultProps}
                    onSelect={onSelect}
                />,
            )

            const trigger = screen.getByRole('button', { name: /Available/i })
            await user.click(trigger)

            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /Lunch break/i }),
                ).toBeInTheDocument()
            })

            const lunchBreakOption = screen.getByRole('option', {
                name: /Lunch break/i,
            })
            await user.click(lunchBreakOption)

            expect(onSelect).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: '1',
                    name: 'Lunch break',
                }),
            )
        })

        it('should call onSelect with system status when system option is clicked', async () => {
            const onSelect = vi.fn()
            const { user } = render(
                <AgentAvailabilityStatusSelect
                    {...defaultProps}
                    activeAvailabilityStatus={AVAILABLE_STATUS}
                    onSelect={onSelect}
                />,
            )

            const trigger = screen.getByRole('button', { name: /Available/i })
            await user.click(trigger)

            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /Unavailable/i }),
                ).toBeInTheDocument()
            })

            const unavailableOption = screen.getByRole('option', {
                name: /Unavailable/i,
            })
            await user.click(unavailableOption)

            expect(onSelect).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'unavailable',
                    name: 'Unavailable',
                }),
            )
        })
    })

    describe('Disabled state', () => {
        it('should disable select when isDisabled prop is true', () => {
            render(
                <AgentAvailabilityStatusSelect
                    {...defaultProps}
                    isDisabled={true}
                />,
            )

            const trigger = screen.getByRole('button', { name: /Available/i })
            expect(trigger).toBeDisabled()
        })

        it('should hide caret when disabled', () => {
            render(
                <AgentAvailabilityStatusSelect
                    {...defaultProps}
                    isDisabled={true}
                />,
            )

            expect(screen.queryByText('▾')).not.toBeInTheDocument()
        })

        it('should show caret when enabled', () => {
            render(
                <AgentAvailabilityStatusSelect
                    {...defaultProps}
                    isDisabled={false}
                />,
            )

            expect(screen.getByText('▾')).toBeInTheDocument()
        })
    })

    describe('Empty states', () => {
        it('should render only system statuses when no custom statuses exist', async () => {
            mockUseSelectableAgentAvailabilityStatuses([])

            const { user } = render(
                <AgentAvailabilityStatusSelect {...defaultProps} />,
            )

            const trigger = screen.getByRole('button', { name: /Available/i })
            await user.click(trigger)

            await waitFor(() => {
                const options = screen.getAllByRole('option')
                expect(options.length).toBe(2) // Only system statuses
            })
        })
    })

    describe('Status options rendering', () => {
        it('should render unavailable status option', async () => {
            const { user } = render(
                <AgentAvailabilityStatusSelect {...defaultProps} />,
            )

            const trigger = screen.getByRole('button', { name: /Available/i })
            await user.click(trigger)

            await waitFor(() => {
                const unavailableOption = screen.getByRole('option', {
                    name: /Unavailable/i,
                })
                expect(unavailableOption).toBeInTheDocument()
            })
        })

        it('should render custom status options', async () => {
            const { user } = render(
                <AgentAvailabilityStatusSelect {...defaultProps} />,
            )

            const trigger = screen.getByRole('button', { name: /Available/i })
            await user.click(trigger)

            await waitFor(() => {
                const lunchBreakOption = screen.getByRole('option', {
                    name: /Lunch break/i,
                })
                expect(lunchBreakOption).toBeInTheDocument()
            })
        })
    })
})
