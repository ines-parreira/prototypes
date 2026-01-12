import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import type { ChartDataItem } from '../ChartCard/types'
import { HorizontalBarChart } from './HorizontalBarChart'

describe('HorizontalBarChart', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            callback: ResizeObserverCallback
            constructor(callback: ResizeObserverCallback) {
                this.callback = callback
            }
            observe(target: Element) {
                this.callback(
                    [
                        {
                            target,
                            contentRect: {
                                width: 500,
                                height: 300,
                            } as DOMRectReadOnly,
                            borderBoxSize: [],
                            contentBoxSize: [],
                            devicePixelContentBoxSize: [],
                        },
                    ],
                    this,
                )
            }
            unobserve() {}
            disconnect() {}
        }
    })

    const mockData: ChartDataItem[] = [
        { name: 'Product/Issues', value: 3203 },
        { name: 'Product/Details', value: 2483 },
        { name: 'Product/Issues2', value: 135 },
        { name: 'Return/Status', value: 89 },
        { name: 'Shipping/Information', value: 84 },
    ]

    const mockDataMoreThanFive: ChartDataItem[] = [
        ...mockData,
        { name: 'Order/Tracking', value: 45 },
        { name: 'Account/Login', value: 23 },
    ]

    const findSvgTextByContent = (container: HTMLElement, text: string) => {
        const svg = container.querySelector('svg')
        if (!svg) return null
        const textElements = svg.querySelectorAll('text')
        return Array.from(textElements).find((el) =>
            el.textContent?.includes(text),
        )
    }

    describe('loading state', () => {
        it('should show skeleton when loading', () => {
            const { container } = render(
                <HorizontalBarChart data={mockData} isLoading />,
            )

            const skeletons = container.querySelectorAll(
                '[data-name="skeleton"]',
            )
            expect(skeletons.length).toBeGreaterThan(0)
        })

        it('should show chart when not loading', () => {
            const { container } = render(
                <HorizontalBarChart data={mockData} isLoading={false} />,
            )

            expect(
                findSvgTextByContent(container, 'Product/Issues'),
            ).toBeTruthy()
            expect(findSvgTextByContent(container, '3,203')).toBeTruthy()
        })

        it('should show chart by default when isLoading is not provided', () => {
            const { container } = render(<HorizontalBarChart data={mockData} />)

            expect(
                findSvgTextByContent(container, 'Product/Issues'),
            ).toBeTruthy()
        })
    })

    describe('data rendering', () => {
        it('should render chart with data without errors', () => {
            const { container } = render(<HorizontalBarChart data={mockData} />)

            mockData.forEach((item) => {
                expect(findSvgTextByContent(container, item.name)).toBeTruthy()
            })
        })

        it('should display formatted values', () => {
            const { container } = render(<HorizontalBarChart data={mockData} />)

            expect(findSvgTextByContent(container, '3,203')).toBeTruthy()
            expect(findSvgTextByContent(container, '2,483')).toBeTruthy()
            expect(findSvgTextByContent(container, '135')).toBeTruthy()
        })

        it('should show empty state when data array is empty', () => {
            render(<HorizontalBarChart data={[]} />)

            expect(screen.getByText('No data found')).toBeInTheDocument()
            expect(
                screen.getByText('Try to adjust your report filters.'),
            ).toBeInTheDocument()
        })

        it('should apply custom valueFormatter', () => {
            const valueFormatter = (value: number) => `$${value}`
            const { container } = render(
                <HorizontalBarChart
                    data={mockData}
                    valueFormatter={valueFormatter}
                />,
            )

            expect(findSvgTextByContent(container, '$3203')).toBeTruthy()
        })
    })

    describe('expand/collapse functionality', () => {
        it('should not show "Show more" button when data length is <= 5', () => {
            render(<HorizontalBarChart data={mockData} />)

            const showMoreButton = screen.queryByRole('button', {
                name: /show more/i,
            })
            expect(showMoreButton).not.toBeInTheDocument()
        })

        it('should show "Show more" button when data length > 5', () => {
            render(<HorizontalBarChart data={mockDataMoreThanFive} />)

            const showMoreButton = screen.getByRole('button', {
                name: /show more/i,
            })
            expect(showMoreButton).toBeInTheDocument()
        })

        it('should not show "Show more" button when showExpandButton is false', () => {
            render(
                <HorizontalBarChart
                    data={mockDataMoreThanFive}
                    showExpandButton={false}
                />,
            )

            const showMoreButton = screen.queryByRole('button', {
                name: /show more/i,
            })
            expect(showMoreButton).not.toBeInTheDocument()
        })

        it('should only show first 5 items initially', () => {
            const { container } = render(
                <HorizontalBarChart data={mockDataMoreThanFive} />,
            )

            expect(
                findSvgTextByContent(container, 'Product/Issues'),
            ).toBeTruthy()
            expect(
                findSvgTextByContent(container, 'Shipping/Information'),
            ).toBeTruthy()
            expect(
                findSvgTextByContent(container, 'Order/Tracking'),
            ).toBeFalsy()
            expect(findSvgTextByContent(container, 'Account/Login')).toBeFalsy()
        })

        it('should expand to show all items when "Show more" is clicked', async () => {
            const { container } = render(
                <HorizontalBarChart data={mockDataMoreThanFive} />,
            )

            const showMoreButton = screen.getByRole('button', {
                name: /show more/i,
            })

            await act(() => userEvent.click(showMoreButton))

            expect(
                findSvgTextByContent(container, 'Order/Tracking'),
            ).toBeTruthy()
            expect(
                findSvgTextByContent(container, 'Account/Login'),
            ).toBeTruthy()

            const showLessButton = screen.getByRole('button', {
                name: /show less/i,
            })
            expect(showLessButton).toBeInTheDocument()
        })

        it('should collapse to show 5 items when "Show less" is clicked', async () => {
            const { container } = render(
                <HorizontalBarChart data={mockDataMoreThanFive} />,
            )

            const showMoreButton = screen.getByRole('button', {
                name: /show more/i,
            })

            await act(() => userEvent.click(showMoreButton))

            const showLessButton = screen.getByRole('button', {
                name: /show less/i,
            })

            await act(() => userEvent.click(showLessButton))

            expect(
                findSvgTextByContent(container, 'Order/Tracking'),
            ).toBeFalsy()
            expect(findSvgTextByContent(container, 'Account/Login')).toBeFalsy()

            const showMoreButtonAgain = screen.getByRole('button', {
                name: /show more/i,
            })
            expect(showMoreButtonAgain).toBeInTheDocument()
        })

        it('should use custom initialItemsCount', () => {
            const threeItemData = mockData.slice(0, 4)
            render(
                <HorizontalBarChart
                    data={threeItemData}
                    initialItemsCount={3}
                />,
            )

            const showMoreButton = screen.getByRole('button', {
                name: /show more/i,
            })
            expect(showMoreButton).toBeInTheDocument()
        })
    })

    describe('bar rendering', () => {
        it('should render bars for each data item', () => {
            const { container } = render(<HorizontalBarChart data={mockData} />)

            mockData.forEach((item) => {
                expect(findSvgTextByContent(container, item.name)).toBeTruthy()
            })
        })
    })
})
