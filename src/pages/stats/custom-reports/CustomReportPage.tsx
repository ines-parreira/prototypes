import {useGetAnalyticsCustomReport} from '@gorgias/api-queries'
import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import React, {useCallback, useState} from 'react'
import {useParams} from 'react-router-dom'

import {useDashboardNameValidation} from 'hooks/reporting/custom-reports/useDashboardNameValidation'
import {useUpdateDashboard} from 'hooks/reporting/custom-reports/useUpdateDashboard'
import {useUpdateDashboardCache} from 'hooks/reporting/custom-reports/useUpdateDashboardCache'
import useAppSelector from 'hooks/useAppSelector'
import {useNotify} from 'hooks/useNotify'
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

const DashboardPage = ({dashboard}: {dashboard: CustomReportSchema}) => {
    const notify = useNotify()

    const currentUser = useAppSelector(getCurrentUser)
    const isCurrentUserTeamLead = isTeamLead(currentUser)

    const [isOpen, setIsOpen] = useState(false)
    const closeModal = useCallback(() => setIsOpen(false), [])

    const {updateDashboard, isLoading} = useUpdateDashboard(dashboard.id)

    const updateDashboardCache = useUpdateDashboardCache(dashboard.id)

    const handleUpdateCharts = async (
        charts: CustomReportChild[],
        size: number
    ) => {
        try {
            await updateDashboard({...dashboard, children: charts})

            closeModal()
            void notify.success(
                `Successfully saved ${size} ${size === 1 ? 'chart' : 'charts'} to ${dashboard.name}`
            )
        } catch (error) {
            void notify.error(getErrorMessage(error))
        }
    }

    const [details, setDetails] = useState({
        name: dashboard.name,
        emoji: dashboard.emoji || '',
    })

    const {isValid, isInvalid} = useDashboardNameValidation(
        details.name,
        dashboard.name
    )

    const handleUpdateName = async () => {
        try {
            if (isValid) {
                await updateDashboard({
                    ...dashboard,
                    name: details.name,
                    emoji: details.emoji,
                })
            }
        } catch (error) {
            void notify.error(getErrorMessage(error))
        }
    }

    const handleMoveCharts = (dashboard: CustomReportSchema) => {
        updateDashboardCache(dashboard)
    }

    const handleMoveChartsEnd = async () => {
        try {
            await updateDashboard(dashboard)
        } catch (error) {
            void notify.error(getErrorMessage(error))
        }
    }

    return (
        <StatsPageWrapper>
            <StatsPageHeader
                left={
                    <DashboardName
                        value={details}
                        onChange={setDetails}
                        onBlur={handleUpdateName}
                        error={isInvalid}
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
                    <CustomReport
                        customReport={dashboard}
                        onChartMove={handleMoveCharts}
                        onChartMoveEnd={handleMoveChartsEnd}
                    />
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
