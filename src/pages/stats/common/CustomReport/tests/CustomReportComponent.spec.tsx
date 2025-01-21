import {render, screen} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {CustomReportComponent} from 'pages/stats/custom-reports/CustomReportComponent'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'

const content = 'Test'
const chart = 'chart-id'

const config = {
    charts: {
        [chart]: {
            chartComponent: (props: DashboardChartProps) => (
                <>
                    <div>{content}</div>
                    <div>{props?.chartId}</div>
                </>
            ),
        },
    },
} as any

describe('<CustomReportComponent />', () => {
    it('renders not render chartId if activateActionsMenu is false and featureFlag is false', () => {
        render(
            <CustomReportComponent
                chart={chart}
                config={config}
                activateActionsMenu={false}
            />
        )

        expect(screen.getByText(content)).toBeInTheDocument()
        expect(screen.queryByText(chart)).not.toBeInTheDocument()
    })

    it('renders not render chartId if activateActionsMenu is false and featureFlag is true', () => {
        render(
            <CustomReportComponent
                chart={chart}
                config={config}
                activateActionsMenu
            />
        )

        expect(screen.getByText(content)).toBeInTheDocument()
        expect(screen.queryByText(chart)).not.toBeInTheDocument()
    })

    it('should render report component with chartId when both activateActionsMenu and featureFlag are true', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsCustomReports]: true,
        })

        render(
            <CustomReportComponent
                chart={chart}
                config={config}
                activateActionsMenu
            />
        )

        expect(screen.getByText(content)).toBeInTheDocument()
        expect(screen.getByText(chart)).toBeInTheDocument()
    })
})
