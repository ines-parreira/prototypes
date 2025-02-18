import React, {useCallback, useState} from 'react'
import {useHistory} from 'react-router-dom'

import {useCustomReportActions} from 'hooks/reporting/custom-reports/useCustomReportActions'
import {useDashboardNameValidation} from 'hooks/reporting/custom-reports/useDashboardNameValidation'
import {useNotify} from 'hooks/useNotify'
import Button from 'pages/common/components/button/Button'
import {CreateCustomReport} from 'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport'
import {CustomReportsModal} from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal'
import {
    DashboardName,
    DashboardNameValue,
} from 'pages/stats/custom-reports/DashboardName'
import {CustomReportChild} from 'pages/stats/custom-reports/types'
import {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'pages/stats/StatsPage'

export const CUSTOM_REPORT_CTA = 'Add Charts'

export const createDashboardName = (): string => {
    const [date, time] = new Date().toISOString().split('T')
    const [h, m] = time.split(':')

    const formattedDate = [date, h, m].join('-')

    return `Untitled-${formattedDate}`
}

export const CustomReports = () => {
    const history = useHistory()
    const notify = useNotify()

    const [isOpen, setIsOpen] = useState(false)
    const closeModal = useCallback(() => setIsOpen(false), [])
    const openModal = useCallback(() => setIsOpen(true), [])

    const [details, setDetails] = useState<DashboardNameValue>({
        name: createDashboardName(),
        emoji: '',
    })

    const {error} = useDashboardNameValidation(details.name)

    const {createDashboardHandler, isCreateMutationLoading} =
        useCustomReportActions()

    const handleCreateCustomReport = useCallback(
        (charts: CustomReportChild[]) => {
            return createDashboardHandler({
                dashboard: {
                    ...details,
                    children: charts,
                    name: details.name.trim(),
                },
                onSuccess: (response) => {
                    history.push(`/app/stats/custom-reports/${response?.id}`)
                    closeModal()
                },
            })
        },
        [closeModal, createDashboardHandler, details, history]
    )

    return (
        <StatsPageWrapper>
            <StatsPageHeader
                left={
                    <DashboardName
                        value={details}
                        onChange={setDetails}
                        onBlur={() => {
                            if (error) void notify.error(error)
                        }}
                        error={error}
                        autoFocus
                    />
                }
                right={
                    <Button
                        onClick={openModal}
                        isDisabled={isCreateMutationLoading}
                    >
                        {CUSTOM_REPORT_CTA}
                    </Button>
                }
            />
            <StatsPageContent>
                <CreateCustomReport />
            </StatsPageContent>
            <CustomReportsModal
                isOpen={isOpen}
                onSave={handleCreateCustomReport}
                onCancel={closeModal}
                isLoading={isCreateMutationLoading}
            />
        </StatsPageWrapper>
    )
}
