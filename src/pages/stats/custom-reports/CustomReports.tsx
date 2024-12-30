import React, {useCallback} from 'react'
import {useHistory} from 'react-router-dom'

import {useCreateCustomReport} from 'hooks/reporting/custom-reports/useCreateCustomReport'
import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import {CreateCustomReport} from 'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport'
import {
    CustomReportNameForm,
    CustomReportNameFormSubmitHandler,
} from 'pages/stats/custom-reports/CustomReportNameForm'
import {getErrorMessage} from 'pages/stats/custom-reports/utils'
import {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'pages/stats/StatsPage'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export const CUSTOM_REPORT_CTA = 'Add Charts'

const FORM_ID = 'custom-report-name-form'

export const CustomReports = () => {
    const history = useHistory()
    const dispatch = useAppDispatch()

    const {createCustomReport, isLoading, isError} = useCreateCustomReport()

    const handleCreateCustomReport: CustomReportNameFormSubmitHandler =
        useCallback(
            async (formData) => {
                try {
                    const {data} = await createCustomReport(formData)
                    history.push(`/app/stats/custom-reports/${data.id}`)
                } catch (error) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: getErrorMessage(error),
                        })
                    )
                }
            },
            [createCustomReport, dispatch, history]
        )

    return (
        <StatsPageWrapper>
            <StatsPageHeader
                left={
                    <CustomReportNameForm
                        id={FORM_ID}
                        onSubmit={handleCreateCustomReport}
                        isError={isError}
                    />
                }
                right={
                    <Button form={FORM_ID} type="submit" isDisabled={isLoading}>
                        {CUSTOM_REPORT_CTA}
                    </Button>
                }
            />
            <StatsPageContent>
                <CreateCustomReport />
            </StatsPageContent>
        </StatsPageWrapper>
    )
}
