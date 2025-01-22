import {useGetAnalyticsCustomReport} from '@gorgias/api-queries'
import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import React, {useCallback, useState} from 'react'
import {useParams} from 'react-router-dom'

import {useUpdateDashboard} from 'hooks/reporting/custom-reports/useUpdateDashboard'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {CreateCustomReport} from 'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport'
import {CustomReport} from 'pages/stats/custom-reports/CustomReport'
import {CustomReportActionButton} from 'pages/stats/custom-reports/CustomReportActionButton'
import {CustomReportsModal} from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal'
import {DashboardName} from 'pages/stats/custom-reports/DashboardName'
import {
    CustomReportChild,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'
import {
    customReportFromApi,
    getErrorMessage,
} from 'pages/stats/custom-reports/utils'
import StatsPage, {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'pages/stats/StatsPage'
import {getCurrentUser} from 'state/currentUser/selectors'
import {notify as notifyAction} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {isTeamLead} from 'utils'

export const CUSTOM_REPORT_SCHEMA_ERROR = 'Custom report schema error'
export const CUSTOM_REPORT_ID_CTA = 'Actions'

export const CustomReportPage = () => {
    const {id} = useParams<{id: string}>()

    const {data, isLoading, isError} = useGetAnalyticsCustomReport(Number(id))

    const dashboard = customReportFromApi(data?.data)

    if (isLoading) {
        return (
            <StatsPage title="">
                <LoadingSpinner />
            </StatsPage>
        )
    }

    if (isError || !dashboard) {
        return (
            <StatsPage title="">
                <div>{CUSTOM_REPORT_SCHEMA_ERROR}</div>
            </StatsPage>
        )
    }

    return <DashboardPage key={dashboard.id} dashboard={dashboard} />
}

const useNotify = () => {
    const dispatch = useAppDispatch()
    return useCallback(
        (config: {status: NotificationStatus; message: string}) =>
            dispatch(notifyAction(config)),
        [dispatch]
    )
}

const isValidName = (name: string) => name.trim().length > 2

const DashboardPage = ({dashboard}: {dashboard: CustomReportSchema}) => {
    const notify = useNotify()

    const currentUser = useAppSelector(getCurrentUser)
    const isCurrentUserTeamLead = isTeamLead(currentUser)

    const [isOpen, setIsOpen] = useState(false)
    const closeModal = useCallback(() => setIsOpen(false), [])

    const {updateDashboard, isLoading} = useUpdateDashboard(dashboard.id)

    const handleUpdateCharts = async (
        charts: CustomReportChild[],
        size: number
    ) => {
        try {
            await updateDashboard({...dashboard, children: charts})

            closeModal()

            void notify({
                status: NotificationStatus.Success,
                message: `Successfully saved ${size} ${size === 1 ? 'chart' : 'charts'} to ${dashboard.name}`,
            })
        } catch (error) {
            void notify({
                status: NotificationStatus.Error,
                message: getErrorMessage(error),
            })
        }
    }

    const [details, setDetails] = useState({
        name: dashboard.name,
        emoji: dashboard.emoji || '',
    })

    const handleUpdateName = async () => {
        try {
            if (isValidName(details.name)) {
                await updateDashboard({
                    ...dashboard,
                    name: details.name,
                    emoji: details.emoji,
                })
            }
        } catch (error) {
            void notify({
                status: NotificationStatus.Error,
                message: getErrorMessage(error),
            })
        }
    }

    return (
        <StatsPageWrapper>
            <StatsPageHeader
                left={
                    <DashboardName
                        value={details}
                        onChange={setDetails}
                        isInvalid={!isValidName(details.name)}
                        onBlur={handleUpdateName}
                    />
                }
                right={
                    isCurrentUserTeamLead && (
                        <CustomReportActionButton
                            setOpenModal={setIsOpen}
                            customReport={dashboard}
                        />
                    )
                }
            />
            <StatsPageContent>
                {dashboard.children.length ? (
                    <CustomReport customReport={dashboard} />
                ) : (
                    <CreateCustomReport />
                )}
                <CustomReportsModal
                    isOpen={isOpen}
                    onCancel={closeModal}
                    onSave={handleUpdateCharts}
                    charts={dashboard.children}
                    isLoading={isLoading}
                />
            </StatsPageContent>
        </StatsPageWrapper>
    )
}
