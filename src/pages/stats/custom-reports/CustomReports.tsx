import {noop} from 'lodash'
import React from 'react'

import Button from 'pages/common/components/button/Button'
import {CreateCustomReport} from 'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport'
import {CustomReportNameInput} from 'pages/stats/custom-reports/CustomReportNameInput'
import {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'pages/stats/StatsPage'

export const CUSTOM_REPORT_CTA = 'Add Charts'

export function CustomReports() {
    return (
        <StatsPageWrapper>
            <StatsPageHeader
                left={<CustomReportNameInput onChange={noop} />}
                right={<Button>{CUSTOM_REPORT_CTA}</Button>}
            />
            <StatsPageContent>
                <CreateCustomReport />
            </StatsPageContent>
        </StatsPageWrapper>
    )
}
