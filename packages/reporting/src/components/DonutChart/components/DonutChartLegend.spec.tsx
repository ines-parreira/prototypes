import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DonutChartHoverProvider } from '../context/DonutChartHoverContext'
import { DonutChartLegend } from './DonutChartLegend'

const renderWithProvider = (ui: React.ReactElement) => {
    return render(<DonutChartHoverProvider>{ui}</DonutChartHoverProvider>)
}

let resizeObserverCallback: ResizeObserverCallback | null = null

describe('DonutChartLegend', () => {
    beforeEach(() => {
        resizeObserverCallback = null

        global.ResizeObserver = class ResizeObserver {
            callback: ResizeObserverCallback
            constructor(callback: ResizeObserverCallback) {
                this.callback = callback
                resizeObserverCallback = callback
            }
            observe() {}
            unobserve() {}
            disconnect() {}
        }
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })
    const mockItems = [
        {
            name: 'Item 1',
            color: '#ff0000',
            percentage: '50%',
            legendValue: '50%',
        },
        {
            name: 'Item 2',
            color: '#00ff00',
            percentage: '30%',
            legendValue: '30%',
        },
        {
            name: 'Item 3',
            color: '#0000ff',
            percentage: '20%',
            legendValue: '20%',
        },
    ]

    it('should render all legend items', () => {
        const mockOnToggle = vi.fn()
        renderWithProvider(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={new Set()}
                onToggleSegment={mockOnToggle}
            />,
        )

        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 2')).toBeInTheDocument()
        expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should render percentages for each item', () => {
        const mockOnToggle = vi.fn()
        renderWithProvider(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={new Set()}
                onToggleSegment={mockOnToggle}
            />,
        )

        expect(screen.getByText('50%')).toBeInTheDocument()
        expect(screen.getByText('30%')).toBeInTheDocument()
        expect(screen.getByText('20%')).toBeInTheDocument()
    })

    it('should render color dots with correct colors', () => {
        const mockOnToggle = vi.fn()
        const { container } = renderWithProvider(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={new Set()}
                onToggleSegment={mockOnToggle}
            />,
        )

        const dots = container.querySelectorAll('[style*="background-color"]')
        expect(dots).toHaveLength(3)
        expect(dots[0]).toHaveStyle({ backgroundColor: '#ff0000' })
        expect(dots[1]).toHaveStyle({ backgroundColor: '#00ff00' })
        expect(dots[2]).toHaveStyle({ backgroundColor: '#0000ff' })
    })

    it('should call onToggleSegment when item is clicked', async () => {
        const user = userEvent.setup()
        const mockOnToggle = vi.fn()
        renderWithProvider(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={new Set()}
                onToggleSegment={mockOnToggle}
            />,
        )

        const item1Button = screen.getByRole('button', { name: /item 1 50%/i })
        await user.click(item1Button)

        expect(mockOnToggle).toHaveBeenCalledWith('Item 1')
    })

    it('should apply reduced opacity to hidden segments', () => {
        const mockOnToggle = vi.fn()
        const hiddenSegments = new Set(['Item 2'])

        const { container } = renderWithProvider(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={hiddenSegments}
                onToggleSegment={mockOnToggle}
            />,
        )

        const dots = container.querySelectorAll('[style*="background-color"]')
        expect(dots[1]).toHaveStyle({ opacity: '0.3' })
    })

    it('should keep full opacity for visible segments', () => {
        const mockOnToggle = vi.fn()
        const hiddenSegments = new Set(['Item 2'])

        const { container } = renderWithProvider(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={hiddenSegments}
                onToggleSegment={mockOnToggle}
            />,
        )

        const dots = container.querySelectorAll('[style*="background-color"]')
        expect(dots[0]).toHaveStyle({ opacity: '1' })
        expect(dots[2]).toHaveStyle({ opacity: '1' })
    })

    it('should render buttons with type="button"', () => {
        const mockOnToggle = vi.fn()
        renderWithProvider(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={new Set()}
                onToggleSegment={mockOnToggle}
            />,
        )

        const buttons = screen.getAllByRole('button')
        buttons.forEach((button) => {
            expect(button).toHaveAttribute('type', 'button')
        })
    })

    it('should handle multiple hidden segments', () => {
        const mockOnToggle = vi.fn()
        const hiddenSegments = new Set(['Item 1', 'Item 3'])

        const { container } = renderWithProvider(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={hiddenSegments}
                onToggleSegment={mockOnToggle}
            />,
        )

        const dots = container.querySelectorAll('[style*="background-color"]')
        expect(dots[0]).toHaveStyle({ opacity: '0.3' })
        expect(dots[1]).toHaveStyle({ opacity: '1' })
        expect(dots[2]).toHaveStyle({ opacity: '0.3' })
    })

    it('should handle empty items array', () => {
        const mockOnToggle = vi.fn()
        renderWithProvider(
            <DonutChartLegend
                items={[]}
                hiddenSegments={new Set()}
                onToggleSegment={mockOnToggle}
            />,
        )

        const buttons = screen.queryAllByRole('button')
        expect(buttons).toHaveLength(0)
    })

    it('should be keyboard accessible', async () => {
        const mockOnToggle = vi.fn()
        renderWithProvider(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={new Set()}
                onToggleSegment={mockOnToggle}
            />,
        )

        const firstButton = screen.getByRole('button', {
            name: /item 1 50%/i,
        })
        firstButton.focus()

        expect(firstButton).toHaveFocus()
    })

    describe('two-column layout', () => {
        const fourItems = [
            {
                name: 'Item 1',
                color: '#ff0000',
                percentage: '40%',
                legendValue: '40%',
            },
            {
                name: 'Item 2',
                color: '#00ff00',
                percentage: '30%',
                legendValue: '30%',
            },
            {
                name: 'Item 3',
                color: '#0000ff',
                percentage: '20%',
                legendValue: '20%',
            },
            {
                name: 'Item 4',
                color: '#ffff00',
                percentage: '10%',
                legendValue: '10%',
            },
        ]

        it('should render in two columns when container width is >= 400px', () => {
            const mockOnToggle = vi.fn()
            const { container } = renderWithProvider(
                <DonutChartLegend
                    items={fourItems}
                    hiddenSegments={new Set()}
                    onToggleSegment={mockOnToggle}
                />,
            )

            const legendContainer = container.firstChild as HTMLElement
            vi.spyOn(legendContainer, 'offsetWidth', 'get').mockReturnValue(450)

            act(() => {
                if (resizeObserverCallback) {
                    resizeObserverCallback([], {} as ResizeObserver)
                }
            })

            expect(screen.getByText('Item 1')).toBeInTheDocument()
            expect(screen.getByText('Item 2')).toBeInTheDocument()
            expect(screen.getByText('Item 3')).toBeInTheDocument()
            expect(screen.getByText('Item 4')).toBeInTheDocument()
        })

        it('should distribute items correctly across columns (odd indices in right, even in left)', () => {
            const mockOnToggle = vi.fn()
            const { container } = renderWithProvider(
                <DonutChartLegend
                    items={fourItems}
                    hiddenSegments={new Set()}
                    onToggleSegment={mockOnToggle}
                />,
            )

            const legendContainer = container.firstChild as HTMLElement
            vi.spyOn(legendContainer, 'offsetWidth', 'get').mockReturnValue(450)

            act(() => {
                if (resizeObserverCallback) {
                    resizeObserverCallback([], {} as ResizeObserver)
                }
            })

            const buttons = screen.getAllByRole('button')
            expect(buttons).toHaveLength(4)
        })

        it('should render in single column when container width is < 400px', () => {
            const mockOnToggle = vi.fn()
            const { container } = renderWithProvider(
                <DonutChartLegend
                    items={fourItems}
                    hiddenSegments={new Set()}
                    onToggleSegment={mockOnToggle}
                />,
            )

            const legendContainer = container.firstChild as HTMLElement
            vi.spyOn(legendContainer, 'offsetWidth', 'get').mockReturnValue(350)

            act(() => {
                if (resizeObserverCallback) {
                    resizeObserverCallback([], {} as ResizeObserver)
                }
            })

            const buttons = screen.getAllByRole('button')
            expect(buttons).toHaveLength(4)
            expect(screen.getByText('Item 1')).toBeInTheDocument()
            expect(screen.getByText('Item 4')).toBeInTheDocument()
        })

        it('should handle hidden segments in two-column layout', () => {
            const mockOnToggle = vi.fn()
            const hiddenSegments = new Set(['Item 2', 'Item 4'])
            const { container } = renderWithProvider(
                <DonutChartLegend
                    items={fourItems}
                    hiddenSegments={hiddenSegments}
                    onToggleSegment={mockOnToggle}
                />,
            )

            const legendContainer = container.firstChild as HTMLElement
            vi.spyOn(legendContainer, 'offsetWidth', 'get').mockReturnValue(450)

            act(() => {
                if (resizeObserverCallback) {
                    resizeObserverCallback([], {} as ResizeObserver)
                }
            })

            const dots = container.querySelectorAll(
                '[style*="background-color"]',
            )
            expect(dots[0]).toHaveStyle({ opacity: '1' })
            expect(dots[1]).toHaveStyle({ opacity: '1' })
            expect(dots[2]).toHaveStyle({ opacity: '0.3' })
            expect(dots[3]).toHaveStyle({ opacity: '0.3' })
        })

        it('should call onToggleSegment in two-column layout', async () => {
            const user = userEvent.setup()
            const mockOnToggle = vi.fn()
            const { container } = renderWithProvider(
                <DonutChartLegend
                    items={fourItems}
                    hiddenSegments={new Set()}
                    onToggleSegment={mockOnToggle}
                />,
            )

            const legendContainer = container.firstChild as HTMLElement
            vi.spyOn(legendContainer, 'offsetWidth', 'get').mockReturnValue(450)

            act(() => {
                if (resizeObserverCallback) {
                    resizeObserverCallback([], {} as ResizeObserver)
                }
            })

            const item3Button = screen.getByRole('button', {
                name: /item 3 20%/i,
            })
            await user.click(item3Button)

            expect(mockOnToggle).toHaveBeenCalledWith('Item 3')
        })

        it('should switch to two columns when width increases above threshold', () => {
            const mockOnToggle = vi.fn()
            const { container } = renderWithProvider(
                <DonutChartLegend
                    items={fourItems}
                    hiddenSegments={new Set()}
                    onToggleSegment={mockOnToggle}
                />,
            )

            const legendContainer = container.firstChild as HTMLElement
            vi.spyOn(legendContainer, 'offsetWidth', 'get').mockReturnValue(300)

            act(() => {
                if (resizeObserverCallback) {
                    resizeObserverCallback([], {} as ResizeObserver)
                }
            })

            vi.spyOn(legendContainer, 'offsetWidth', 'get').mockReturnValue(500)

            act(() => {
                if (resizeObserverCallback) {
                    resizeObserverCallback([], {} as ResizeObserver)
                }
            })

            expect(screen.getAllByRole('button')).toHaveLength(4)
        })

        it('should switch to single column when width decreases below threshold', () => {
            const mockOnToggle = vi.fn()
            const { container } = renderWithProvider(
                <DonutChartLegend
                    items={fourItems}
                    hiddenSegments={new Set()}
                    onToggleSegment={mockOnToggle}
                />,
            )

            const legendContainer = container.firstChild as HTMLElement
            vi.spyOn(legendContainer, 'offsetWidth', 'get').mockReturnValue(450)

            act(() => {
                if (resizeObserverCallback) {
                    resizeObserverCallback([], {} as ResizeObserver)
                }
            })

            vi.spyOn(legendContainer, 'offsetWidth', 'get').mockReturnValue(300)

            act(() => {
                if (resizeObserverCallback) {
                    resizeObserverCallback([], {} as ResizeObserver)
                }
            })

            expect(screen.getAllByRole('button')).toHaveLength(4)
        })

        it('should handle exactly at breakpoint (400px)', () => {
            const mockOnToggle = vi.fn()
            const { container } = renderWithProvider(
                <DonutChartLegend
                    items={fourItems}
                    hiddenSegments={new Set()}
                    onToggleSegment={mockOnToggle}
                />,
            )

            const legendContainer = container.firstChild as HTMLElement
            vi.spyOn(legendContainer, 'offsetWidth', 'get').mockReturnValue(400)

            act(() => {
                if (resizeObserverCallback) {
                    resizeObserverCallback([], {} as ResizeObserver)
                }
            })

            expect(screen.getAllByRole('button')).toHaveLength(4)
        })
    })
})
