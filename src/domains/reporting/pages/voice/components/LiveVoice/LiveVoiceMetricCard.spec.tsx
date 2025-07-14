import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { VoiceCallSummaryMeasure } from 'domains/reporting/models/cubes/VoiceCallSummaryCube'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import * as utils from 'domains/reporting/pages/common/utils'
import { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import { LiveVoiceMetricCard } from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceMetricCard'
import { useMetricFormat } from 'domains/reporting/pages/voice/hooks/useMetricFormat'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/pages/common/components/BigNumberMetric')
jest.mock('domains/reporting/pages/common/components/MetricCard')
jest.mock('domains/reporting/pages/common/drill-down/DrillDownModalTrigger')
jest.mock('domains/reporting/pages/voice/hooks/useMetricFormat')

const BigNumberMetricMock = assumeMock(BigNumberMetric)
const MetricCardMock = assumeMock(MetricCard)
const DrillDownModalTriggerMock = assumeMock(DrillDownModalTrigger)
const useMetricFormatMock = assumeMock(useMetricFormat)

const renderComponent = (props: any) => {
    return render(<LiveVoiceMetricCard {...props} />)
}

const mockMetricFormat = {
    metricValue: '100',
    isFetching: false,
    selectedFormat: 'integer' as MetricValueFormat,
    setSelectedFormat: jest.fn(),
}

const defaultMetric = {
    data: { value: 100 },
    isFetching: false,
    isError: false,
}

describe('LiveVoiceMetricCard', () => {
    beforeEach(() => {
        BigNumberMetricMock.mockImplementation(({ children }) => (
            <div>{children}</div>
        ))
        MetricCardMock.mockImplementation(({ children, titleExtra }) => (
            <div>
                {children}
                {titleExtra}
            </div>
        ))
        DrillDownModalTriggerMock.mockImplementation(({ children }) => (
            <div>{children}</div>
        ))
        useMetricFormatMock.mockReturnValue(mockMetricFormat)
    })

    it('renders the title and hint', () => {
        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            metric: defaultMetric,
        }

        renderComponent(props)

        expect(MetricCardMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                title: props.title,
                hint: { title: props.hint },
                isLoading: false,
            }),
            {},
        )
    })

    it.each([
        {
            inputMetricValueFormat: undefined,
            outputMetricValueFormat: 'integer',
        },
        {
            inputMetricValueFormat: 'decimal',
            outputMetricValueFormat: 'decimal',
        },
    ])(
        'renders the metric value',
        ({ inputMetricValueFormat, outputMetricValueFormat }) => {
            useMetricFormatMock.mockReturnValue({
                ...mockMetricFormat,
                metricValue: 'Metric Value',
            })

            const props = {
                title: 'Test Title',
                hint: 'Test Hint',
                metric: defaultMetric,
                metricValueFormat: inputMetricValueFormat,
                metricName: 'Test Metric',
            }

            renderComponent(props)

            expect(useMetricFormatMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    defaultValueFormat: outputMetricValueFormat,
                    storageKey: 'Test Metric',
                }),
            )

            expect(screen.getByText('Metric Value')).toBeInTheDocument()
        },
    )

    it('renders the metric value when metric data is object and measure is provided', () => {
        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            metric: {
                data: {
                    [VoiceCallSummaryMeasure.VoiceCallSummaryTotal]: 101,
                },
                isFetching: false,
                isError: false,
            },
            measure: VoiceCallSummaryMeasure.VoiceCallSummaryTotal,
        }

        renderComponent(props)

        expect(useMetricFormatMock).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 101,
            }),
        )
    })

    it('renders the DrillDownModalTrigger when metricName is provided', () => {
        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            metric: defaultMetric,
            metricName: 'Test Metric',
        }

        renderComponent(props)

        expect(DrillDownModalTriggerMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                metricData: {
                    metricName: props.metricName,
                    title: props.title,
                },
            }),
            {},
        )
    })

    it('does not render the DrillDownModalTrigger when metricName is not provided', () => {
        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            metric: defaultMetric,
        }

        renderComponent(props)

        expect(DrillDownModalTriggerMock).not.toHaveBeenCalled()
    })

    it('renders the DrillDownModalTrigger with enabled=false when value is not provided', () => {
        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            metric: { data: null },
            metricName: 'Test Metric',
        }

        renderComponent(props)

        expect(DrillDownModalTriggerMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
            {},
        )
    })

    it('renders empty metric when should hide', () => {
        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            metric: defaultMetric,
            shouldHide: true,
        }

        renderComponent(props)

        expect(MetricCardMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                title: props.title,
                hint: { title: props.hint },
                isLoading: false,
            }),
            {},
        )
        expect(
            screen.getByText(utils.NOT_AVAILABLE_PLACEHOLDER),
        ).toBeInTheDocument()
    })

    describe('count/percentage format toggle', () => {
        it('does not render format toggle when there is no totalCallsQueryFactory', () => {
            const props = {
                title: 'Test Title',
                hint: 'Test Hint',
                metric: defaultMetric,
            }

            renderComponent(props)

            expect(screen.queryByText('#')).not.toBeInTheDocument()
            expect(screen.queryByText('%')).not.toBeInTheDocument()
        })

        it('switches to percentage format when selected format is integer', () => {
            useMetricFormatMock.mockReturnValue({
                ...mockMetricFormat,
                selectedFormat: 'integer',
            })

            const props = {
                title: 'Test Title',
                hint: 'Test Hint',
                metric: {
                    ...defaultMetric,
                    data: {
                        [VoiceCallSummaryMeasure.VoiceCallSummaryInboundTotal]: 100,
                    },
                },
                showPercentage: true,
                totalCallsQueryFactory: jest.fn(),
            }

            renderComponent(props)

            expect(screen.getByText('#')).toBeInTheDocument()
            expect(screen.getByText('%')).toBeInTheDocument()

            fireEvent.click(screen.getByText('%'))
            expect(mockMetricFormat.setSelectedFormat).toHaveBeenCalledWith(
                'percent',
            )
        })

        it('switches to count format when selected format is percentage', () => {
            useMetricFormatMock.mockReturnValue({
                ...mockMetricFormat,
                selectedFormat: 'percent',
            })

            const props = {
                title: 'Test Title',
                hint: 'Test Hint',
                metric: {
                    ...defaultMetric,
                    data: {
                        [VoiceCallSummaryMeasure.VoiceCallSummaryInboundTotal]: 100,
                    },
                },
                showPercentage: true,
                totalCallsQueryFactory: jest.fn(),
            }

            renderComponent(props)

            expect(screen.getByText('#')).toBeInTheDocument()
            expect(screen.getByText('%')).toBeInTheDocument()

            fireEvent.click(screen.getByText('#'))
            expect(mockMetricFormat.setSelectedFormat).toHaveBeenCalledWith(
                'integer',
            )
        })
    })
})
