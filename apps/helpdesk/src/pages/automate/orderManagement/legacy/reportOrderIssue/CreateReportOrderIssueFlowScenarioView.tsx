import React, { useMemo, useState } from 'react'

import _isEqual from 'lodash/isEqual'
import { Link, useHistory, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import type {
    ReportIssueCaseReason,
    SelfServiceReportIssueCase,
} from 'models/selfServiceConfiguration/types'
import AutomateView from 'pages/automate/common/components/AutomateView'
import AutomateViewContent from 'pages/automate/common/components/AutomateViewContent'
import { ORDER_MANAGEMENT } from 'pages/automate/common/components/constants'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import ReportOrderIssueScenarioForm from './components/ReportOrderIssueScenarioForm'
import type { ReportOrderIssueScenarioFormContextType } from './components/ReportOrderIssueScenarioFormContext'
import ReportOrderIssueScenarioFormContext from './components/ReportOrderIssueScenarioFormContext'
import { DEFAULT_SCENARIO } from './constants'
import useReportOrderIssueFlowScenarios from './hooks/useReportOrderIssueFlowScenarios'
import ReportOrderIssueFlowScenarioPreview from './ReportOrderIssueFlowScenarioPreview'

const CreateReportOrderIssueFlowScenarioView = () => {
    const history = useHistory()
    const { shopName } = useParams<{ shopName: string }>()
    const {
        isCreatePending,
        storeIntegration,
        selfServiceConfiguration,
        handleScenarioCreate,
    } = useReportOrderIssueFlowScenarios(shopName)
    const isAutomateSettings = useIsAutomateSettings()

    const [errors, setErrors] = useState<Record<string, true>>({})
    const [scenario, setScenario] =
        useState<SelfServiceReportIssueCase>(DEFAULT_SCENARIO)

    const [expandedReasonKey, setExpandedReasonKey] = useState<
        ReportIssueCaseReason['reasonKey'] | null
    >(null)
    const [hoveredReasonKey, setHoveredReasonKey] = useState<
        ReportIssueCaseReason['reasonKey'] | null
    >(null)

    const hasError = Object.keys(errors).length > 0
    const reportOrderIssueScenarioFormContext: ReportOrderIssueScenarioFormContextType =
        useMemo(
            () => ({
                isUpdatePending: isCreatePending,
                errors,
                hasError,
                setError: (path, hasError) => {
                    setErrors((prevErrors) => {
                        const nextErrors = { ...prevErrors }

                        if (hasError) {
                            nextErrors[path] = true
                        } else {
                            delete nextErrors[path]
                        }

                        return _isEqual(prevErrors, nextErrors)
                            ? prevErrors
                            : nextErrors
                    })
                },
                storeIntegration,
            }),
            [isCreatePending, errors, hasError, storeIntegration],
        )

    const handleSubmit = () => {
        void handleScenarioCreate(scenario)
    }
    const handleCancel = () => {
        history.push(
            isAutomateSettings
                ? `/app/settings/order-management/shopify/${shopName}/report-issue`
                : `/app/automation/shopify/${shopName}/order-management/report-issue`,
        )
    }

    const isLoading = !selfServiceConfiguration

    return (
        <AutomateView
            title={
                isAutomateSettings ? undefined : (
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/automation/shopify/${shopName}/order-management`}
                            >
                                {ORDER_MANAGEMENT}
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/automation/shopify/${shopName}/order-management/report-issue`}
                            >
                                Report order issue
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Create scenario</BreadcrumbItem>
                    </Breadcrumb>
                )
            }
            isLoading={isLoading}
        >
            <AutomateViewContent
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmittable={!hasError && !isCreatePending}
                isCancelable={!isCreatePending}
            >
                <ReportOrderIssueScenarioFormContext.Provider
                    value={reportOrderIssueScenarioFormContext}
                >
                    <ReportOrderIssueScenarioForm
                        value={scenario}
                        expandedReason={expandedReasonKey}
                        onExpandedReasonChange={setExpandedReasonKey}
                        onHoveredReasonChange={setHoveredReasonKey}
                        isFallback={false}
                        onPreviewChange={setScenario}
                        onChange={setScenario}
                    />
                </ReportOrderIssueScenarioFormContext.Provider>
            </AutomateViewContent>
            <ReportOrderIssueFlowScenarioPreview
                reasons={scenario.newReasons}
                expandedReasonKey={expandedReasonKey}
                hoveredReasonKey={hoveredReasonKey}
            />
        </AutomateView>
    )
}

export default CreateReportOrderIssueFlowScenarioView
