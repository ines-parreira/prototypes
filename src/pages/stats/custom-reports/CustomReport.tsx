import {noop} from 'lodash'
import React from 'react'
import {useParams} from 'react-router-dom'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {CustomReportNameInput} from 'pages/stats/custom-reports/CustomReportNameInput'
import {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'pages/stats/StatsPage'

export const CUSTOM_REPORT_TITLE = 'CUSTOM REPORT ID:'
export const CUSTOM_REPORT_ID_CTA = 'Actions'

export const CustomReport = () => {
    const {id} = useParams<{id: string}>()

    return (
        <StatsPageWrapper>
            <StatsPageHeader
                left={
                    <CustomReportNameInput
                        initialValues={{name: 'My Custom Report', emoji: '🤘'}}
                        onChange={noop}
                    />
                }
                right={
                    // TODO: Implement dropdown
                    <ButtonIconLabel position="right" icon="more_vert">
                        {CUSTOM_REPORT_ID_CTA}
                    </ButtonIconLabel>
                }
            />
            <StatsPageContent>
                {CUSTOM_REPORT_TITLE} {id}
            </StatsPageContent>
        </StatsPageWrapper>
    )
}
