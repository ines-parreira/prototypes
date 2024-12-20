import {useGetAnalyticsCustomReport} from '@gorgias/api-queries'
import noop from 'lodash/noop'
import React, {useMemo} from 'react'
import {useParams} from 'react-router-dom'
import {Spinner} from 'reactstrap'

import useAppSelector from 'hooks/useAppSelector'
import {CustomReport} from 'pages/stats/custom-reports/CustomReport'
import {CustomReportActionButton} from 'pages/stats/custom-reports/CustomReportActionButton'
import {CustomReportNameInput} from 'pages/stats/custom-reports/CustomReportNameInput'
import {customReportFromApi} from 'pages/stats/custom-reports/utils'
import {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'pages/stats/StatsPage'
import {getCurrentUser} from 'state/currentUser/selectors'
import {isTeamLead} from 'utils'

export const CUSTOM_REPORT_SCHEMA_ERROR = 'Custom report schema error'
export const CUSTOM_REPORT_ID_CTA = 'Actions'

export const CustomReportPage = () => {
    const currentUser = useAppSelector(getCurrentUser)

    const {id} = useParams<{id: string}>()
    const {data, isLoading} = useGetAnalyticsCustomReport(Number(id))
    const customReport = data?.data

    const isCurrentUserAnAdmin = useMemo(
        () => isTeamLead(currentUser),
        [currentUser]
    )

    return (
        <StatsPageWrapper>
            <StatsPageHeader
                left={
                    <CustomReportNameInput
                        onChange={noop}
                        initialValues={customReport}
                    />
                }
                right={
                    isCurrentUserAnAdmin && (
                        <CustomReportActionButton customReport={customReport} />
                    )
                }
            />
            <StatsPageContent>
                {isLoading ? (
                    <Spinner />
                ) : customReport ? (
                    <CustomReport
                        customReport={customReportFromApi(customReport)}
                    />
                ) : (
                    <div>{CUSTOM_REPORT_SCHEMA_ERROR}</div>
                )}
            </StatsPageContent>
        </StatsPageWrapper>
    )
}
