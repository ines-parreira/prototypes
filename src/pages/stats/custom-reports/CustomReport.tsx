import React from 'react'
import {useParams} from 'react-router-dom'

import HeaderTitle from 'pages/common/components/HeaderTitle'
import {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'pages/stats/StatsPage'

export const CUSTOM_REPORT_TITLE = 'CUSTOM REPORT ID:'

export const CustomReport = () => {
    const {id} = useParams<{id: string}>()

    return (
        <StatsPageWrapper>
            <StatsPageHeader left={<HeaderTitle title="Custom Report" />} />
            <StatsPageContent>
                {CUSTOM_REPORT_TITLE} {id}
            </StatsPageContent>
        </StatsPageWrapper>
    )
}
