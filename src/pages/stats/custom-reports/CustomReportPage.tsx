import {useGetAnalyticsCustomReport} from '@gorgias/api-queries'
import noop from 'lodash/noop'
import React, {useMemo, useState} from 'react'
import {useParams} from 'react-router-dom'
import {Spinner} from 'reactstrap'

import useAppSelector from 'hooks/useAppSelector'
import {CreateCustomReport} from 'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport'
import {CustomReport} from 'pages/stats/custom-reports/CustomReport'
import {CustomReportActionButton} from 'pages/stats/custom-reports/CustomReportActionButton'
import {CustomReportNameInput} from 'pages/stats/custom-reports/CustomReportNameInput'
import {CustomReportsModal} from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal'
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

    const isCurrentUserAnAdmin = useMemo(
        () => isTeamLead(currentUser),
        [currentUser]
    )

    const {data, isLoading, isError} = useGetAnalyticsCustomReport(Number(id))

    const [isModalOpen, setOpenModal] = useState<boolean>(false)

    const customReport = customReportFromApi(data?.data)

    const isEditMode = !!customReport?.children.length

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
                        <CustomReportActionButton
                            isModalOpen={isModalOpen}
                            setOpenModal={setOpenModal}
                            customReport={customReport}
                            isEditMode={isEditMode}
                        />
                    )
                }
            />
            <StatsPageContent>
                {isLoading ? (
                    <Spinner />
                ) : isError ? (
                    <div>{CUSTOM_REPORT_SCHEMA_ERROR}</div>
                ) : isEditMode ? (
                    <CustomReport customReport={customReport} />
                ) : (
                    <CreateCustomReport />
                )}
                <CustomReportsModal
                    isOpen={isModalOpen}
                    setIsOpen={setOpenModal}
                    customReport={customReport}
                />
            </StatsPageContent>
        </StatsPageWrapper>
    )
}
