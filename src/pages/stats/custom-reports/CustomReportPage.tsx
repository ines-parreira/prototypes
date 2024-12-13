import {useGetAnalyticsCustomReport} from '@gorgias/api-queries'
import {noop} from 'lodash'

import React from 'react'
import {useParams} from 'react-router-dom'

import {Spinner} from 'reactstrap'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {CustomReport} from 'pages/stats/custom-reports/CustomReport'
import {CustomReportNameInput} from 'pages/stats/custom-reports/CustomReportNameInput'

import {customReportFromApi} from 'pages/stats/custom-reports/utils'
import {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'pages/stats/StatsPage'

export const CUSTOM_REPORT_SCHEMA_ERROR = 'Custom report schema error'
export const CUSTOM_REPORT_ID_CTA = 'Actions'

export const CustomReportPage = () => {
    const {id} = useParams<{id: string}>()
    const {data, isLoading} = useGetAnalyticsCustomReport(Number(id))
    const customReport = data?.data

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
                    <ButtonIconLabel position="right" icon="more_vert">
                        {CUSTOM_REPORT_ID_CTA}
                    </ButtonIconLabel>
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
