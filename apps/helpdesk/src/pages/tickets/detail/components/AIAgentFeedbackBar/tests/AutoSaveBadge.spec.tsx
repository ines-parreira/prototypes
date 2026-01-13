import { act, render, screen, waitFor } from '@testing-library/react'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import AutoSaveBadge from '../AutoSaveBadge'

jest.useFakeTimers()

const mockTooltip = jest.fn(({ children, placement }) => (
    <div data-testid="tooltip" data-placement={placement}>
        Tooltip
        {children}
    </div>
))

jest.mock('@gorgias/axiom', () => {
    return {
        ...jest.requireActual('@gorgias/axiom'),
        LegacyLoadingSpinner: () => <div>Spinner</div>,
        LegacyTooltip: (props: any) => mockTooltip(props),
    }
})

// Mock useGetDateAndTimeFormat hook
jest.mock('hooks/useGetDateAndTimeFormat')
const useGetDateAndTimeFormatMock = useGetDateAndTimeFormat as jest.Mock

describe('AutoSaveBadge', () => {
    beforeEach(() => {
        // Set default mock implementation for the hook
        useGetDateAndTimeFormatMock.mockReturnValue('MMMM DD, YYYY')
    })

    afterEach(() => {
        jest.clearAllTimers()
        jest.clearAllMocks()
        mockTooltip.mockClear()
    })

    it('renders nothing when state is INITIAL', () => {
        const { container } = render(
            <AutoSaveBadge state={AutoSaveState.INITIAL} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders saving spinner and text when state is SAVING', () => {
        render(<AutoSaveBadge state={AutoSaveState.SAVING} />)

        expect(screen.getByText('Saving')).toBeInTheDocument()
        expect(screen.getByText('Spinner')).toBeInTheDocument()
    })

    it('renders saved check icon and text, hides text after timeout', async () => {
        render(<AutoSaveBadge state={AutoSaveState.SAVED} />)

        expect(screen.getByText('check')).toBeInTheDocument()
        expect(screen.getByText('Saved')).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(screen.queryByText('Saved')).not.toBeInTheDocument()
        })
    })

    it('should show tooltip after STALE_TIMEOUT if updatedAt is provided', async () => {
        const updatedAt = new Date()
        render(
            <AutoSaveBadge state={AutoSaveState.SAVED} updatedAt={updatedAt} />,
        )

        expect(screen.queryByText('Tooltip')).not.toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(screen.queryByText('Tooltip')).toBeInTheDocument()
        })
    })

    it('should not show tooltip if updatedAt is not provided', async () => {
        render(<AutoSaveBadge state={AutoSaveState.SAVED} />)

        expect(screen.queryByText('Tooltip')).not.toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(screen.queryByText('Tooltip')).not.toBeInTheDocument()
        })
    })

    it('should handle string updatedAt prop correctly', async () => {
        const dateString = new Date('2023-01-01T12:00:00Z')
        render(
            <AutoSaveBadge
                state={AutoSaveState.SAVED}
                updatedAt={dateString}
            />,
        )

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(screen.queryByText('Tooltip')).toBeInTheDocument()
        })
    })

    it('should handle initial state with updatedAt correctly', async () => {
        const updatedAt = new Date()
        render(
            <AutoSaveBadge
                state={AutoSaveState.INITIAL}
                updatedAt={updatedAt}
            />,
        )

        // Should not be empty when state is INITIAL but updatedAt is provided
        expect(screen.getByText('check')).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(screen.queryByText('Tooltip')).toBeInTheDocument()
        })
    })

    it('should render custom icon when savedIcon prop is provided', () => {
        const customIcon = <div data-testid="custom-icon">Custom Icon</div>
        render(
            <AutoSaveBadge
                state={AutoSaveState.SAVED}
                savedIcon={customIcon}
            />,
        )

        expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
        expect(screen.getByText('Custom Icon')).toBeInTheDocument()
        expect(screen.queryByText('check')).not.toBeInTheDocument()
    })

    it('should render default check icon when savedIcon prop is not provided', () => {
        render(<AutoSaveBadge state={AutoSaveState.SAVED} />)

        expect(screen.getByText('check')).toBeInTheDocument()
    })

    it('should pass tooltipPlacement prop to Tooltip component', async () => {
        const updatedAt = new Date()
        render(
            <AutoSaveBadge
                state={AutoSaveState.SAVED}
                updatedAt={updatedAt}
                tooltipPlacement="bottom-start"
            />,
        )

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(mockTooltip).toHaveBeenCalled()
            const lastCall =
                mockTooltip.mock.calls[mockTooltip.mock.calls.length - 1]
            expect(lastCall[0].placement).toBe('bottom-start')
        })
    })

    it('should use default tooltip placement when tooltipPlacement prop is not provided', async () => {
        const updatedAt = new Date()
        render(
            <AutoSaveBadge state={AutoSaveState.SAVED} updatedAt={updatedAt} />,
        )

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(mockTooltip).toHaveBeenCalled()
            const lastCall =
                mockTooltip.mock.calls[mockTooltip.mock.calls.length - 1]
            expect(lastCall[0].placement).toBeUndefined()
        })
    })

    describe('minimal variant', () => {
        it('should render badge during saving state', () => {
            render(
                <AutoSaveBadge
                    state={AutoSaveState.SAVING}
                    variant="minimal"
                />,
            )

            expect(screen.getByText('Saving')).toBeInTheDocument()
            expect(screen.getByText('Spinner')).toBeInTheDocument()
        })

        it('should render badge with "Saved" text immediately after save', async () => {
            const updatedAt = new Date()
            render(
                <AutoSaveBadge
                    state={AutoSaveState.SAVED}
                    updatedAt={updatedAt}
                    variant="minimal"
                />,
            )

            expect(screen.getByText('Saved')).toBeInTheDocument()
        })

        it('should transition to icon-only (no badge) after stale timeout', async () => {
            const updatedAt = new Date()
            const { container } = render(
                <AutoSaveBadge
                    state={AutoSaveState.SAVED}
                    updatedAt={updatedAt}
                    variant="minimal"
                />,
            )

            act(() => {
                jest.advanceTimersByTime(3000)
            })

            await waitFor(() => {
                expect(screen.queryByText('Saved')).not.toBeInTheDocument()
                expect(screen.getByText('check')).toBeInTheDocument()
                expect(
                    container.querySelector('.autoSaveBadgeMinimal'),
                ).toBeInTheDocument()
            })
        })

        it('should render custom icon in minimal mode', async () => {
            const updatedAt = new Date()
            const customIcon = <div data-testid="custom-icon">Custom Icon</div>
            const { container } = render(
                <AutoSaveBadge
                    state={AutoSaveState.SAVED}
                    updatedAt={updatedAt}
                    savedIcon={customIcon}
                    variant="minimal"
                />,
            )

            act(() => {
                jest.advanceTimersByTime(3000)
            })

            await waitFor(() => {
                expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
                expect(
                    container.querySelector('.autoSaveBadgeMinimal'),
                ).toBeInTheDocument()
            })
        })

        it('should still show tooltip after transition to icon-only', async () => {
            const updatedAt = new Date()
            render(
                <AutoSaveBadge
                    state={AutoSaveState.SAVED}
                    updatedAt={updatedAt}
                    variant="minimal"
                />,
            )

            act(() => {
                jest.advanceTimersByTime(3000)
            })

            await waitFor(() => {
                expect(screen.queryByText('Tooltip')).toBeInTheDocument()
            })
        })
    })
})
