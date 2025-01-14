import {useGetAnalyticsCustomReport} from '@gorgias/api-queries'
import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import React, {useCallback, useMemo, useState} from 'react'
import {useParams} from 'react-router-dom'

import {useUpdateCustomReportName} from 'hooks/reporting/custom-reports/useUpdateCustomReportName'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {CreateCustomReport} from 'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport'
import {CustomReport} from 'pages/stats/custom-reports/CustomReport'
import {CustomReportActionButton} from 'pages/stats/custom-reports/CustomReportActionButton'
import {
    CustomReportNameForm,
    CustomReportNameFormSubmitHandler,
} from 'pages/stats/custom-reports/CustomReportNameForm'
import {CustomReportsModal} from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal'
import {CustomReportSchema} from 'pages/stats/custom-reports/types'

import {
    customReportFromApi,
    getErrorMessage,
} from 'pages/stats/custom-reports/utils'
import {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'pages/stats/StatsPage'
import {getCurrentUser} from 'state/currentUser/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {isTeamLead} from 'utils'

export const CUSTOM_REPORT_SCHEMA_ERROR = 'Custom report schema error'
export const CUSTOM_REPORT_ID_CTA = 'Actions'

export const CustomReportPage = () => {
    const dispatch = useAppDispatch()

    const currentUser = useAppSelector(getCurrentUser)

    const {id} = useParams<{id: string}>()
    const {data, isLoading, isError} = useGetAnalyticsCustomReport(Number(id))
    const customReport: CustomReportSchema | undefined = customReportFromApi(
        data?.data
    )

    const isCurrentUserAnAdmin = useMemo(
        () => isTeamLead(currentUser),
        [currentUser]
    )

    const [isModalOpen, setOpenModal] = useState<boolean>(false)
    const {updateCustomReport} = useUpdateCustomReportName(Number(id))

    const handleUpdateCustomReportName: CustomReportNameFormSubmitHandler =
        useCallback(
            async ({name, emoji}) => {
                try {
                    return await updateCustomReport({
                        ...customReport,
                        name,
                        emoji,
                    })
                } catch (error) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: getErrorMessage(error),
                        })
                    )
                }
            },
            [updateCustomReport, customReport, dispatch]
        )

    return (
        <StatsPageWrapper>
            <StatsPageHeader
                left={
                    <CustomReportNameForm
                        key={customReport?.id}
                        onSubmit={handleUpdateCustomReportName}
                        initialValues={customReport ?? {name: 'Loading...'}}
                    />
                }
                right={
                    isCurrentUserAnAdmin && (
                        <CustomReportActionButton
                            setOpenModal={setOpenModal}
                            customReport={customReport}
                        />
                    )
                }
            />
            <StatsPageContent>
                {isLoading ? (
                    <LoadingSpinner />
                ) : isError ? (
                    <div>{CUSTOM_REPORT_SCHEMA_ERROR}</div>
                ) : customReport ? (
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
