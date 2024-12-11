import {noop} from 'lodash'
import React from 'react'

import Button from 'pages/common/components/button/Button'
import {CustomReportNameInput} from 'pages/stats/custom-reports/CustomReportNameInput'
import {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'pages/stats/StatsPage'

export const CUSTOM_REPORTS_TITLE = 'CUSTOM REPORTS'
export const CUSTOM_REPORT_CTA = 'Add Charts'

export function CustomReports() {
    return (
        <StatsPageWrapper>
            <StatsPageHeader
                left={<CustomReportNameInput onChange={noop} />}
                right={<Button>{CUSTOM_REPORT_CTA}</Button>}
            />
            <StatsPageContent>{CUSTOM_REPORTS_TITLE}</StatsPageContent>
        </StatsPageWrapper>
    )
}
