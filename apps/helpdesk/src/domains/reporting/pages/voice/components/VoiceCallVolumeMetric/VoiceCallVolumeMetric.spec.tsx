import { assumeMock } from '@repo/testing'
import { fireEvent, waitFor } from '@testing-library/react'

import {
    formatMetricValue,
    MetricValueFormat,
} from 'domains/reporting/pages/common/utils'
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
})
