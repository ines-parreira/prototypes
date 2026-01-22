import { formatMetricValue } from '@repo/reporting'
import type { MetricValueFormat } from '@repo/reporting'
import { assumeMock } from '@repo/testing'
import { fireEvent, waitFor } from '@testing-library/react'

import VoiceCallVolumeMetric from 'domains/reporting/pages/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import { useMetricFormat } from 'domains/reporting/pages/voice/hooks/useMetricFormat'
import { useVoiceCallCountTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallCountTrend'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

jest.mock('domains/reporting/pages/voice/hooks/useVoiceCallCountTrend')
const mockUseVoiceCallCountTrend = assumeMock(useVoiceCallCountTrend)
jest.mock('domains/reporting/pages/voice/hooks/useMetricFormat')
const useMetricFormatMock = assumeMock(useMetricFormat)

const mockMetricFormat = {
    metricValue: '100',
    isFetching: false,
    selectedFormat: 'integer' as MetricValueFormat,
    setSelectedFormat: jest.fn(),
}

describe('<VoiceCallVolumeMetric />', () => {
    const period = {
        end_datetime: '2021-02-03T23:59:59.999Z',
        start_datetime: '2021-02-03T00:00:00.000Z',
    }
    const defaultProps = {
        title: 'Total calls',
        hint: 'Total number of inbound and outbound calls',
        statsFilters: {
            period,
        },
        metricTrend: {
            data: {
                prevValue: 10,
                value: 15,
            },
            isError: false,
            isFetching: false,
        },
    }
    const renderComponent = (componentProps = {}) => {
        mockUseVoiceCallCountTrend.mockReturnValue(defaultProps.metricTrend)
        return renderWithStoreAndQueryClientProvider(
            <VoiceCallVolumeMetric {...defaultProps} {...componentProps} />,
        )
    }

    beforeEach(() => {
        useMetricFormatMock.mockImplementation((props) => ({
            ...mockMetricFormat,
            metricValue: props.value?.toString() || '0',
        }))
    })

    it('should render', async () => {
        const trendValue = {
            data: {
                prevValue: 10,
                value: 15,
            },
            isError: false,
            isFetching: false,
        }

        const { getByText, container } = renderComponent({
            metricTrend: trendValue,
        })

        expect(getByText('Total calls')).toBeInTheDocument()
        expect(getByText('50%')).toHaveClass('positive')
        expect(getByText('15')).toBeInTheDocument()

        fireEvent.mouseOver(getByText('50%'))
        await waitFor(() => {
            expect(container.querySelector('.tooltip')).toBeInTheDocument()
            expect(
                document.querySelector('.tooltip-inner')?.textContent,
            ).toEqual(
                `Vs. ${formatMetricValue(
                    trendValue.data.prevValue,
                )} on Feb 2nd, 2021`,
            )
        })
    })

    it.each([
        {
            componentProps: {
                multiFormat: true,
                chartId: 'test-chart-id',
                metricTrend: {
                    data: {
                        prevValue: 10,
                        value: 15,
                    },
                    isError: false,
                    isFetching: false,
                },
            },
            expectedArgs: {
                value: 15,
                isPercentageEnabled: true,
                defaultValueFormat: 'percent',
                storageKey: 'test-chart-id',
            },
        },
        {
            componentProps: {
                multiFormat: false,
                chartId: 'test-chart-id',
                metricTrend: {
                    data: {
                        prevValue: 11,
                        value: 12,
                    },
                    isError: false,
                    isFetching: false,
                },
            },
            expectedArgs: {
                value: 12,
                isPercentageEnabled: false,
                defaultValueFormat: 'integer',
                storageKey: 'test-chart-id',
            },
        },
    ])(
        'should send correct args to useMetricFormat',
        ({ componentProps, expectedArgs }) => {
            renderComponent(componentProps)

            expect(useMetricFormatMock).toHaveBeenCalledWith(expectedArgs)
        },
    )

    it('should render less is better', () => {
        const { getByText } = renderComponent({
            moreIsBetter: false,
        })

        expect(getByText('Total calls')).toBeInTheDocument()
        expect(getByText('50%')).toHaveClass('negative')
        expect(getByText('15')).toBeInTheDocument()
    })

    describe('metricValueFormat prop', () => {
        it('should use default format value when metricValueFormat is percent', () => {
            useMetricFormatMock.mockImplementation((props) => ({
                ...mockMetricFormat,
                metricValue: props.value?.toString() || '0',
            }))

            const { getByText } = renderComponent({
                metricValueFormat: 'percent',
                metricTrend: {
                    data: {
                        prevValue: 10,
                        value: 85.5,
                    },
                    isError: false,
                    isFetching: false,
                },
            })

            const expectedFormattedValue = formatMetricValue(85.5, 'percent')
            expect(getByText(expectedFormattedValue)).toBeInTheDocument()
        })

        it('should use computed metric value when metricValueFormat is integer', () => {
            useMetricFormatMock.mockImplementation(() => ({
                ...mockMetricFormat,
                metricValue: '42',
            }))

            const { getByText } = renderComponent({
                metricValueFormat: 'integer',
                metricTrend: {
                    data: {
                        prevValue: 10,
                        value: 42,
                    },
                    isError: false,
                    isFetching: false,
                },
            })

            expect(getByText('42')).toBeInTheDocument()
        })

        it('should use computed metric value when metricValueFormat is duration', () => {
            useMetricFormatMock.mockImplementation(() => ({
                ...mockMetricFormat,
                metricValue: '2m 30s',
            }))

            const { getByText } = renderComponent({
                metricValueFormat: 'duration',
                metricTrend: {
                    data: {
                        prevValue: 100,
                        value: 150,
                    },
                    isError: false,
                    isFetching: false,
                },
            })

            expect(getByText('2m 30s')).toBeInTheDocument()
        })

        it('should default to integer format when metricValueFormat is not provided', () => {
            useMetricFormatMock.mockImplementation((props) => ({
                ...mockMetricFormat,
                metricValue: props.value?.toString() || '0',
            }))

            renderComponent({
                metricTrend: {
                    data: {
                        prevValue: 10,
                        value: 25,
                    },
                    isError: false,
                    isFetching: false,
                },
            })

            expect(useMetricFormatMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: 25,
                    defaultValueFormat: 'integer',
                }),
            )
        })
    })
})
