import React, {useCallback, useState} from 'react'
import {useHistory} from 'react-router-dom'

import {useCreateCustomReport} from 'hooks/reporting/custom-reports/useCreateCustomReport'
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
import {getErrorMessage} from 'pages/stats/custom-reports/utils'
import {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'pages/stats/StatsPage'

export const CUSTOM_REPORT_CTA = 'Add Charts'

const createDashboardName = () => {
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
        name: '',
        emoji: '',
    })

    const {error, isInvalid} = useDashboardNameValidation(details.name)

    const {createCustomReport, isLoading} = useCreateCustomReport()

    const handleCreateCustomReport = useCallback(
        async (charts: CustomReportChild[]) => {
            try {
                const {data} = await createCustomReport({
                    ...details,
                    name: details.name.trim() || createDashboardName(),
                    children: charts,
                })
                history.push(`/app/stats/custom-reports/${data.id}`)
            } catch (error) {
                closeModal()

                void notify.error(getErrorMessage(error))
            }
        },
        [closeModal, createCustomReport, details, notify, history]
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
                        error={isInvalid}
                        autoFocus
                    />
                }
                right={
                    <Button onClick={openModal} isDisabled={isLoading}>
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
                isLoading={isLoading}
            />
        </StatsPageWrapper>
    )
}
