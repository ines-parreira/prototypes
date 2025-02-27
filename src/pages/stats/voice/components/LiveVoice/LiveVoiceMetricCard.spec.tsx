import React from 'react'

import { render, screen } from '@testing-library/react'

import BigNumberMetric from 'pages/stats/BigNumberMetric'
import * as utils from 'pages/stats/common/utils'
import { DrillDownModalTrigger } from 'pages/stats/DrillDownModalTrigger'
import MetricCard from 'pages/stats/MetricCard'
import { LiveVoiceMetricCard } from 'pages/stats/voice/components/LiveVoice/LiveVoiceMetricCard'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/BigNumberMetric')
jest.mock('pages/stats/MetricCard')
jest.mock('pages/stats/DrillDownModalTrigger')

const formatMetricValueSpy = jest.spyOn(utils, 'formatMetricValue')
const BigNumberMetricMock = assumeMock(BigNumberMetric)
const MetricCardMock = assumeMock(MetricCard)
const DrillDownModalTriggerMock = assumeMock(DrillDownModalTrigger)

const renderComponent = (props: any) => {
    return render(<LiveVoiceMetricCard {...props} />)
}

describe('LiveVoiceMetricCard', () => {
    beforeEach(() => {
        formatMetricValueSpy.mockReturnValue('Formatted Value')
        BigNumberMetricMock.mockImplementation(({ children }) => (
            <div>{children}</div>
        ))
        MetricCardMock.mockImplementation(({ children }) => (
            <div>{children}</div>
        ))
        DrillDownModalTriggerMock.mockImplementation(({ children }) => (
            <div>{children}</div>
        ))
    })

    it('renders the title and hint', () => {
        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            fetchData: () => ({ data: { value: 100 }, isFetching: false }),
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
            const props = {
                title: 'Test Title',
                hint: 'Test Hint',
                fetchData: () => ({ data: { value: 100 } }),
                metricValueFormat: inputMetricValueFormat,
            }

            renderComponent(props)

            expect(screen.getByText('Formatted Value')).toBeInTheDocument()
            expect(formatMetricValueSpy).toHaveBeenCalledWith(
                100,
                outputMetricValueFormat,
                utils.NOT_AVAILABLE_PLACEHOLDER,
            )
        },
    )

    it('renders the DrillDownModalTrigger when metricName is provided', () => {
        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            fetchData: () => ({ data: { value: 100 } }),
            metricName: 'Test Metric',
        }

        renderComponent(props)

        expect(DrillDownModalTriggerMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                metricData: {
                    metricName: props.metricName,
                    title: props.title,
                },
                useNewFilterData: true,
            }),
            {},
        )
    })

    it('does not render the DrillDownModalTrigger when metricName is not provided', () => {
        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            fetchData: () => ({ data: { value: 100 } }),
        }

        renderComponent(props)

        expect(DrillDownModalTriggerMock).not.toHaveBeenCalled()
    })

    it('renders the DrillDownModalTrigger with enabled=false when value is not provided', () => {
        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            fetchData: () => ({ data: null }),
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
        const fetchData = jest.fn()

        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            fetchData: fetchData,
            shouldHide: true,
        }

        renderComponent(props)

        expect(fetchData).not.toHaveBeenCalled()
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
})
