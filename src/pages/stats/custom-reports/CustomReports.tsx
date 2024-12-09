import React from 'react'

import HeaderTitle from 'pages/common/components/HeaderTitle'
import {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'pages/stats/StatsPage'

export const CUSTOM_REPORTS_TITLE = 'CUSTOM REPORTS'

export function CustomReports() {
    return (
        <StatsPageWrapper>
            <StatsPageHeader left={<HeaderTitle title="Custom Reports" />} />
            <StatsPageContent>{CUSTOM_REPORTS_TITLE}</StatsPageContent>
        </StatsPageWrapper>
    )
}
