import { ComponentProps } from 'react'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import colorTokens from '@gorgias/design-tokens/tokens/colors'

import { useTheme } from 'core/theme'
import css from 'domains/reporting/pages/common/components/charts/Chart.less'
import DonutChart, {
    DONUT_TOOLTIP_TARGET,
} from 'domains/reporting/pages/common/components/charts/DonutChart/DonutChart'
import { useCustomTooltip } from 'domains/reporting/pages/common/useCustomTooltip'
import { assumeMock } from 'utils/testing'

const mockDoughnutProps = jest.fn()

jest.mock('react-chartjs-2', () => ({
    Doughnut: (props: unknown) => {
        mockDoughnutProps(props)

        return <>mock Doughnut</>
    },
}))

jest.mock('core/theme')
const useThemeMock = assumeMock(useTheme)

jest.mock('domains/reporting/pages/common/useCustomTooltip')
const useCustomTooltipMock = assumeMock(useCustomTooltip)

const mockTheme = {
    tokens: {
        Neutral: {
            Grey_2: { value: 'grey' },
        },
    },
}

const renderComponent = (props: Partial<ComponentProps<typeof DonutChart>>) => {
    render(<DonutChart data={[]} showTooltip={false} {...props} />)
}

describe('<DonutChart />', () => {
    beforeEach(() => {
        mockDoughnutProps.mockClear()
        useThemeMock.mockReturnValue(mockTheme as any)
        useCustomTooltipMock.mockReturnValue({
            customTooltip: jest.fn(),
            tooltipData: {
                dataPoints: [
                    {
                        label: 'label',
                        formattedValue: 'formattedValue',
                        raw: '10',
                    },
                ],
                labelColors: [
                    {
                        backgroundColor: 'red',
                        borderWidth: 1,
                        borderColor: 'red',
                        borderRadius: 1,
                    },
                ],
            },
            tooltipStyle: { opacity: 100, left: 0, top: 0 },
        } as any)
    })

    it('should render loader', () => {
        renderComponent({ isLoading: true })

        expect(mockDoughnutProps).not.toHaveBeenCalled()
        expect(
            document.querySelector('.react-loading-skeleton'),
        ).toBeInTheDocument()
    })

    it('should pass correct data and config', () => {
        renderComponent({
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
            width: 300,
            height: 300,
        })

        expect(mockDoughnutProps).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    labels: ['Label 1', 'Label 2'],
                    datasets: [
                        expect.objectContaining({
                            data: [11, 12],
                        }),
                    ],
                }),
                width: 300,
                height: 300,
            }),
        )
    })

    it('should pass custom colors', () => {
        const customColors = [
            colorTokens.classic.neutral.grey_0.value,
            colorTokens.classic.neutral.grey_6.value,
        ]
        renderComponent({
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
            customColors,
        })

        expect(mockDoughnutProps).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    datasets: [
                        expect.objectContaining({
                            backgroundColor: customColors,
                        }),
                    ],
                }),
            }),
        )
    })

    it('should hide displayLegend when it disabled', () => {
        renderComponent({
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
            displayLegend: false,
        })

        expect(screen.queryByText('Label 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Label 2')).not.toBeInTheDocument()
    })

    it('should show displayLegend when it enabled', () => {
        renderComponent({
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
            displayLegend: true,
        })

        expect(screen.getByText('Label 1')).toBeInTheDocument()
        expect(screen.getByText('Label 2')).toBeInTheDocument()
    })

    it('should render a children element', () => {
        renderComponent({
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
            children: <div>children</div>,
        })
        expect(screen.getByText('children')).toBeInTheDocument()
    })

    it('should pass onSegmentClick', () => {
        const onSegmentClick = jest.fn()
        renderComponent({
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
            onSegmentClick,
        })

        expect(mockDoughnutProps).toHaveBeenCalledWith(
            expect.objectContaining({
                options: expect.objectContaining({
                    onClick: expect.any(Function),
                }),
            }),
        )
    })

    it('should apply custom className if provided', () => {
        renderComponent({
            className: 'custom-class',
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
        })

        expect(document.querySelector('.custom-class')).toBeInTheDocument()
    })
    it('should render custom tooltip if showTooltip is enabled', async () => {
        renderComponent({
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
            showTooltip: true,
            children: (
                <span
                    id={DONUT_TOOLTIP_TARGET}
                    data-testid={DONUT_TOOLTIP_TARGET}
                />
            ),
        })

        fireEvent.mouseOver(screen.getByTestId(DONUT_TOOLTIP_TARGET))

        await waitFor(() => {
            expect(screen.queryByRole('tooltip')).toBeInTheDocument()
        })
    })

    it('should call onSegmentClick with correct index when a segment is clicked', () => {
        const onSegmentClick = jest.fn()
        renderComponent({
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
            onSegmentClick,
        })

        const { options } = mockDoughnutProps.mock.calls[0][0] as any

        expect(options.onClick).toBeDefined()

        const mockEvent = {} // The event object is not used
        const mockElements = [{ index: 1 }] // Simulate clicking on the second segment

        options.onClick(mockEvent, mockElements)

        expect(onSegmentClick).toHaveBeenCalledWith(1)
    })

    it('should update hovered state on hover and reset after mouse leave', async () => {
        jest.useFakeTimers()

        renderComponent({
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
        })

        const initialCall = mockDoughnutProps.mock.calls[0][0]
        const defaultColor0 = colorTokens.classic.main.primary.value
        const defaultColor1 = colorTokens.classic.feedback.warning.value

        expect(initialCall.data.datasets[0].backgroundColor).toEqual([
            defaultColor0,
            defaultColor1,
        ])

        act(() => {
            initialCall.options.onHover(null, [{ index: 1 }])
        })

        const updatedCall =
            mockDoughnutProps.mock.calls[
                mockDoughnutProps.mock.calls.length - 1
            ][0]

        expect(updatedCall.data.datasets[0].backgroundColor).toEqual([
            'grey',
            defaultColor1,
        ])

        const container = document.querySelector(`.${css.container}`)

        expect(container).toBeInTheDocument()

        fireEvent.mouseLeave(container!)

        act(() => {
            jest.advanceTimersByTime(100)
        })

        const finalCall =
            mockDoughnutProps.mock.calls[
                mockDoughnutProps.mock.calls.length - 1
            ][0]

        expect(finalCall.data.datasets[0].backgroundColor).toEqual([
            defaultColor0,
            defaultColor1,
        ])

        jest.useRealTimers()
    })

    it('should render inner label plugin when no children are provided', () => {
        renderComponent({
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
        })

        const { plugins } = mockDoughnutProps.mock.calls[0][0]
        expect(plugins).toHaveLength(1)
        expect(plugins[0].id).toBe('innerLabel')
    })

    it('should not render inner label plugin when children are provided', () => {
        renderComponent({
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
            children: <div>children</div>,
        })

        const { plugins } = mockDoughnutProps.mock.calls[0][0]
        expect(plugins).toHaveLength(0)
    })

    it('should use custom colors for legend when provided', () => {
        const customColors = ['#FF0000', '#00FF00']
        renderComponent({
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
            customColors,
            displayLegend: true,
        })

        const legendItems = document.querySelectorAll('.legendItem')
        expect(legendItems).toHaveLength(2)
        expect(legendItems[0].querySelector('.legendCaret')).toHaveStyle({
            backgroundColor: customColors[0],
        })
        expect(legendItems[1].querySelector('.legendCaret')).toHaveStyle({
            backgroundColor: customColors[1],
        })
    })

    it('should apply custom legend className when provided', () => {
        renderComponent({
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
            displayLegend: true,
            legendClassName: 'custom-legend',
        })

        expect(document.querySelector('.custom-legend')).toBeInTheDocument()
    })

    it('should render skeleton with custom height when provided', () => {
        const skeletonHeight = 200
        renderComponent({
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
            isLoading: true,
            skeletonHeight,
        })

        const skeleton = document.querySelector('.react-loading-skeleton')
        expect(skeleton).toHaveStyle({ height: `${skeletonHeight}px` })
    })

    it('should add clickable class when segment is hovered and onSegmentClick is provided', () => {
        renderComponent({
            data: [
                { label: 'Label 1', value: 11 },
                { label: 'Label 2', value: 12 },
            ],
            onSegmentClick: jest.fn(),
        })

        const initialCall = mockDoughnutProps.mock.calls[0][0]
        const container = document.querySelector(`.${css.container}`)

        expect(container).not.toHaveClass('clickable')

        act(() => {
            initialCall.options.onHover(null, [{ index: 1 }])
        })

        expect(container).toHaveClass('clickable')
    })
})
