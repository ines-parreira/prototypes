import { formatMetricValue, NOT_AVAILABLE_PLACEHOLDER } from '@repo/reporting'
import type { MetricValueFormat } from '@repo/reporting'
import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import { VoiceCallSummaryMeasure } from 'domains/reporting/models/cubes/VoiceCallSummaryCube'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { LiveVoiceMetricCard } from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceMetricCard'
import { useMetricFormat } from 'domains/reporting/pages/voice/hooks/useMetricFormat'

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
        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })

    describe('count/percentage format toggle', () => {
        it('does not render format toggle when there is no totalCallsQueryFactory', () => {
            const props = {
                title: 'Test Title',
                hint: 'Test Hint',
                metric: defaultMetric,
                showPercentage: true,
            }

            renderComponent(props)

            expect(screen.queryByText('#')).not.toBeInTheDocument()
            expect(screen.queryByText('%')).not.toBeInTheDocument()
        })

        it('does not render format toggle when showPercentage is false', () => {
            const props = {
                title: 'Test Title',
                hint: 'Test Hint',
                metric: {
                    ...defaultMetric,
                    data: {
                        [VoiceCallSummaryMeasure.VoiceCallSummaryInboundTotal]: 100,
                    },
                },
                showPercentage: false,
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

    describe('Loading states', () => {
        it('shows loading state when metric is loading', () => {
            const props = {
                title: 'Test Title',
                hint: 'Test Hint',
                metric: {
                    data: null,
                    isLoading: true,
                },
            }

            renderComponent(props)

            expect(MetricCardMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    isLoading: true,
                }),
                {},
            )
            expect(BigNumberMetricMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    isLoading: true,
                }),
                {},
            )
        })

        it('shows loading state when fetching additional format data', () => {
            useMetricFormatMock.mockReturnValue({
                ...mockMetricFormat,
                isFetching: true,
            })

            const props = {
                title: 'Test Title',
                hint: 'Test Hint',
                metric: {
                    data: 100,
                    isLoading: false,
                },
            }

            renderComponent(props)

            expect(MetricCardMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    isLoading: true,
                }),
                {},
            )
            expect(BigNumberMetricMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    isLoading: true,
                }),
                {},
            )
        })

        it('shows loading state when both metric and format are loading', () => {
            useMetricFormatMock.mockReturnValue({
                ...mockMetricFormat,
                isFetching: true,
            })

            const props = {
                title: 'Test Title',
                hint: 'Test Hint',
                metric: {
                    data: null,
                    isLoading: true,
                },
            }

            renderComponent(props)

            expect(MetricCardMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    isLoading: true,
                }),
                {},
            )
        })
    })

    describe('Metric value extraction', () => {
        describe('V2 measure mapping fallback', () => {
            it.each([
                {
                    measure:
                        VoiceCallSummaryMeasure.VoiceCallSummaryInboundTotal,
                    v2Key: 'inboundVoiceCallsCount',
                    value: 10,
                },
                {
                    measure:
                        VoiceCallSummaryMeasure.VoiceCallSummaryOutboundTotal,
                    v2Key: 'outboundVoiceCallsCount',
                    value: 20,
                },
                {
                    measure:
                        VoiceCallSummaryMeasure.VoiceCallSummaryAnsweredTotal,
                    v2Key: 'answeredVoiceCallsCount',
                    value: 30,
                },
                {
                    measure:
                        VoiceCallSummaryMeasure.VoiceCallSummaryCancelledTotal,
                    v2Key: 'cancelledVoiceCallsCount',
                    value: 40,
                },
                {
                    measure:
                        VoiceCallSummaryMeasure.VoiceCallSummaryAbandonedTotal,
                    v2Key: 'abandonedVoiceCallsCount',
                    value: 50,
                },
                {
                    measure:
                        VoiceCallSummaryMeasure.VoiceCallSummaryMissedTotal,
                    v2Key: 'missedVoiceCallsCount',
                    value: 60,
                },
                {
                    measure:
                        VoiceCallSummaryMeasure.VoiceCallSummaryUnansweredTotal,
                    v2Key: 'unansweredVoiceCallsCount',
                    value: 70,
                },
                {
                    measure:
                        VoiceCallSummaryMeasure.VoiceCallSummaryCallbackRequestedTotal,
                    v2Key: 'callbackRequestedVoiceCallsCount',
                    value: 80,
                },
                {
                    measure:
                        VoiceCallSummaryMeasure.VoiceCallSummaryAverageTalkTime,
                    v2Key: 'averageTalkTimeInSeconds',
                    value: 90,
                },
                {
                    measure:
                        VoiceCallSummaryMeasure.VoiceCallSummaryAverageWaitTime,
                    v2Key: 'averageWaitTimeInSeconds',
                    value: 100,
                },
                {
                    measure:
                        VoiceCallSummaryMeasure.VoiceCallSummarySlaAchievementRate,
                    v2Key: 'slaAchievementRate',
                    value: 110,
                },
            ])(
                'extracts value from V2 format for $measure',
                ({ measure, v2Key, value }) => {
                    const props = {
                        title: 'Test Title',
                        hint: 'Test Hint',
                        metric: {
                            data: {
                                [v2Key]: value,
                            },
                        },
                        measure,
                    }

                    renderComponent(props)

                    expect(useMetricFormatMock).toHaveBeenCalledWith(
                        expect.objectContaining({
                            value,
                        }),
                    )
                },
            )

            it('uses direct key when VoiceCallSummaryTotal is provided', () => {
                const props = {
                    title: 'Test Title',
                    hint: 'Test Hint',
                    metric: {
                        data: {
                            [VoiceCallSummaryMeasure.VoiceCallSummaryTotal]: 123,
                        },
                    },
                    measure: VoiceCallSummaryMeasure.VoiceCallSummaryTotal,
                }

                renderComponent(props)

                expect(useMetricFormatMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        value: 123,
                    }),
                )
            })

            it('returns null for unmapped measure with V2 fallback', () => {
                const props = {
                    title: 'Test Title',
                    hint: 'Test Hint',
                    metric: {
                        data: {
                            someOtherKey: 456,
                        },
                    },
                    measure: VoiceCallSummaryMeasure.VoiceCallSummaryTotal,
                }

                renderComponent(props)

                expect(useMetricFormatMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        value: null,
                    }),
                )
            })
        })

        describe('Data type handling', () => {
            it('falls back to V2 measure key when direct measure key does not exist', () => {
                const props = {
                    title: 'Test Title',
                    hint: 'Test Hint',
                    metric: {
                        data: {
                            inboundVoiceCallsCount: 999,
                        },
                    },
                    measure:
                        VoiceCallSummaryMeasure.VoiceCallSummaryInboundTotal,
                }

                renderComponent(props)

                expect(useMetricFormatMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        value: 999,
                    }),
                )
            })

            it('handles primitive number data directly', () => {
                const props = {
                    title: 'Test Title',
                    hint: 'Test Hint',
                    metric: {
                        data: 456,
                    },
                }

                renderComponent(props)

                expect(useMetricFormatMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        value: 456,
                    }),
                )
            })

            it('returns null when data is undefined', () => {
                const props = {
                    title: 'Test Title',
                    hint: 'Test Hint',
                    metric: {
                        data: undefined,
                    },
                }

                renderComponent(props)

                expect(useMetricFormatMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        value: null,
                    }),
                )
            })

            it('returns null when data is object but measure is undefined', () => {
                const props = {
                    title: 'Test Title',
                    hint: 'Test Hint',
                    metric: {
                        data: {
                            someKey: 100,
                        },
                    },
                }

                renderComponent(props)

                expect(useMetricFormatMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        value: null,
                    }),
                )
            })

            it('returns null when neither direct nor V2 measure keys exist in data', () => {
                const props = {
                    title: 'Test Title',
                    hint: 'Test Hint',
                    metric: {
                        data: {
                            otherKey: 100,
                        },
                    },
                    measure:
                        VoiceCallSummaryMeasure.VoiceCallSummaryInboundTotal,
                }

                renderComponent(props)

                expect(useMetricFormatMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        value: null,
                    }),
                )
            })

            it('returns null when data is explicitly null', () => {
                const props = {
                    title: 'Test Title',
                    hint: 'Test Hint',
                    metric: {
                        data: null,
                    },
                }

                renderComponent(props)

                expect(useMetricFormatMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        value: null,
                    }),
                )
            })
        })
    })

    describe('Percentage format', () => {
        describe('Default value format', () => {
            it('sets default value format to percent when showPercentage is true', () => {
                const props = {
                    title: 'Test Title',
                    hint: 'Test Hint',
                    metric: {
                        data: {
                            [VoiceCallSummaryMeasure.VoiceCallSummaryInboundTotal]: 100,
                        },
                    },
                    showPercentage: true,
                }

                renderComponent(props)

                expect(useMetricFormatMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        defaultValueFormat: 'percent',
                        isPercentageEnabled: true,
                    }),
                )
            })

            it('uses metricValueFormat as default when showPercentage is false', () => {
                const props = {
                    title: 'Test Title',
                    hint: 'Test Hint',
                    metric: {
                        data: 100,
                    },
                    metricValueFormat: 'decimal' as MetricValueFormat,
                    showPercentage: false,
                }

                renderComponent(props)

                expect(useMetricFormatMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        defaultValueFormat: 'decimal',
                        isPercentageEnabled: false,
                    }),
                )
            })
        })

        describe('Toggle visibility edge cases', () => {
            it('does not render toggle when percentageOfValue is null', () => {
                const props = {
                    title: 'Test Title',
                    hint: 'Test Hint',
                    metric: {
                        data: {
                            [VoiceCallSummaryMeasure.VoiceCallSummaryAnsweredTotal]: 50,
                        },
                    },
                    showPercentage: true,
                    measure:
                        VoiceCallSummaryMeasure.VoiceCallSummaryAnsweredTotal,
                }

                renderComponent(props)

                expect(MetricCardMock).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        titleExtra: false,
                    }),
                    {},
                )
            })
        })
    })

    describe('DrillDownModalTrigger enabled state', () => {
        it('renders DrillDownModalTrigger with enabled=true when value exists', () => {
            useMetricFormatMock.mockReturnValue({
                ...mockMetricFormat,
                metricValue: '150',
            })

            const props = {
                title: 'Test Title',
                hint: 'Test Hint',
                metric: {
                    data: 150,
                },
                metricName: 'Test Metric',
            }

            renderComponent(props)

            expect(DrillDownModalTriggerMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    enabled: true,
                }),
                {},
            )
        })

        it('renders DrillDownModalTrigger with enabled=false when value is 0', () => {
            const props = {
                title: 'Test Title',
                hint: 'Test Hint',
                metric: {
                    data: 0,
                },
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
    })

    describe('Percent format handling', () => {
        it('uses default formatted value when metricValueFormat is percent', () => {
            const props = {
                title: 'Test Title',
                hint: 'Test Hint',
                metric: {
                    data: 75.5,
                },
                metricValueFormat: 'percent' as MetricValueFormat,
            }

            renderComponent(props)

            const expectedFormattedValue = formatMetricValue(
                75.5,
                'percent',
                NOT_AVAILABLE_PLACEHOLDER,
            )
            expect(screen.getByText(expectedFormattedValue)).toBeInTheDocument()
        })

        it('uses computed metric value when metricValueFormat is not percent', () => {
            useMetricFormatMock.mockReturnValue({
                ...mockMetricFormat,
                metricValue: '42',
            })

            const props = {
                title: 'Test Title',
                hint: 'Test Hint',
                metric: {
                    data: 42,
                },
                metricValueFormat: 'integer' as MetricValueFormat,
            }

            renderComponent(props)

            expect(screen.getByText('42')).toBeInTheDocument()
        })

        it('uses computed metric value when metricValueFormat is duration', () => {
            useMetricFormatMock.mockReturnValue({
                ...mockMetricFormat,
                metricValue: '1m 30s',
            })

            const props = {
                title: 'Test Title',
                hint: 'Test Hint',
                metric: {
                    data: 90,
                },
                metricValueFormat: 'duration' as MetricValueFormat,
            }

            renderComponent(props)

            expect(screen.getByText('1m 30s')).toBeInTheDocument()
        })
    })
})
