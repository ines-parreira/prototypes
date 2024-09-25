import React from 'react'
import {render, screen} from '@testing-library/react'
import LiveVoiceMetricCard from 'pages/stats/voice/components/LiveVoice/LiveVoiceMetricCard'
import * as utils from 'pages/stats/common/utils'
import {assumeMock} from 'utils/testing'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import MetricCard from 'pages/stats/MetricCard'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'

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
        BigNumberMetricMock.mockImplementation(({children}) => (
            <div>{children}</div>
        ))
        MetricCardMock.mockImplementation(({children}) => <div>{children}</div>)
        DrillDownModalTriggerMock.mockImplementation(({children}) => (
            <div>{children}</div>
        ))
    })

    it('renders the title and hint', () => {
        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            isLoading: false,
        }

        renderComponent(props)

        expect(MetricCardMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                title: props.title,
                hint: {title: props.hint},
                isLoading: props.isLoading,
            }),
            {}
        )
    })

    it('renders the metric value', () => {
        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            value: 100,
            isLoading: false,
        }

        renderComponent(props)

        expect(screen.getByText('Formatted Value')).toBeInTheDocument()
    })

    it('renders the loading state', () => {
        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            isLoading: true,
        }

        renderComponent(props)

        expect(BigNumberMetricMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isLoading: props.isLoading,
            }),
            {}
        )
    })

    it('renders the DrillDownModalTrigger when metricName is provided', () => {
        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            value: 100,
            isLoading: false,
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
            {}
        )
    })

    it('does not render the DrillDownModalTrigger when metricName is not provided', () => {
        const props = {
            title: 'Test Title',
            hint: 'Test Hint',
            value: 100,
            isLoading: false,
        }

        renderComponent(props)

        expect(DrillDownModalTriggerMock).not.toHaveBeenCalled()
    })
})
