import React, { useMemo, useRef, useState } from 'react'

import _isEqual from 'lodash/isEqual'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import type { ReportIssueCaseReason } from 'models/selfServiceConfiguration/types'
import AutomateView from 'pages/automate/common/components/AutomateView'
import AutomateViewContent from 'pages/automate/common/components/AutomateViewContent'
import { ORDER_MANAGEMENT } from 'pages/automate/common/components/constants'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import ReportOrderIssueScenarioForm from './components/ReportOrderIssueScenarioForm'
import type { ReportOrderIssueScenarioFormContextType } from './components/ReportOrderIssueScenarioFormContext'
import ReportOrderIssueScenarioFormContext from './components/ReportOrderIssueScenarioFormContext'
import useReportOrderIssueFlowScenario from './hooks/useReportOrderIssueFlowScenario'
import ReportOrderIssueFlowScenarioPreview from './ReportOrderIssueFlowScenarioPreview'

import css from './EditReportOrderIssueFlowScenarioView.less'

const EditReportOrderIssueFlowScenarioView = () => {
    const { shopName, scenarioIndex } = useParams<{
        shopName: string
        scenarioIndex: string
    }>()
    const {
        isUpdatePending,
        isFallback,
        scenario,
        storeIntegration,
        selfServiceConfiguration,
        handleScenarioUpdate,
        handleScenarioDelete,
    } = useReportOrderIssueFlowScenario(shopName, parseInt(scenarioIndex, 10))
    const isAutomateSettings = useIsAutomateSettings()

    const [errors, setErrors] = useState<Record<string, true>>({})
    const [dirtyScenario, setDirtyScenario] = useState(scenario)
    const [expandedReasonKey, setExpandedReasonKey] = useState<
        ReportIssueCaseReason['reasonKey'] | null
    >(null)
    const [hoveredReasonKey, setHoveredReasonKey] = useState<
        ReportIssueCaseReason['reasonKey'] | null
    >(null)
    const previousScenario = useRef(scenario)

    if (previousScenario.current !== scenario) {
        previousScenario.current = scenario

        setDirtyScenario(scenario)
    }

    const hasError = Object.keys(errors).length > 0
    const reportOrderIssueScenarioFormContext: ReportOrderIssueScenarioFormContextType =
        useMemo(
            () => ({
                isUpdatePending,
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
            [isUpdatePending, errors, hasError, storeIntegration],
        )

    const handleSubmit = () => {
        if (dirtyScenario) {
            handleScenarioUpdate(dirtyScenario)
        }
    }
    const handleCancel = () => {
        setDirtyScenario(scenario)
    }

    const isScenarioDirty = !_isEqual(dirtyScenario, scenario)
    const isLoading = !selfServiceConfiguration || !dirtyScenario

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
                        {dirtyScenario && (
                            <BreadcrumbItem active>
                                {dirtyScenario.title}
                            </BreadcrumbItem>
                        )}
                    </Breadcrumb>
                )
            }
            isLoading={isLoading}
        >
            <AutomateViewContent
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmittable={isScenarioDirty && !isUpdatePending && !hasError}
                isCancelable={isScenarioDirty && !isUpdatePending}
                extraButtons={
                    !isFallback && (
                        <ConfirmButton
                            className={css.deleteButton}
                            confirmationButtonIntent="destructive"
                            confirmationContent="Deleting this scenario cannot be undone."
                            confirmationTitle={<b>Delete scenario?</b>}
                            confirmLabel="Delete"
                            fillStyle="ghost"
                            intent="destructive"
                            onConfirm={handleScenarioDelete}
                            placement="top"
                            showCancelButton
                            isDisabled={isUpdatePending}
                            leadingIcon="delete"
                        >
                            Delete Scenario
                        </ConfirmButton>
                    )
                }
            >
                <ReportOrderIssueScenarioFormContext.Provider
                    value={reportOrderIssueScenarioFormContext}
                >
                    <ReportOrderIssueScenarioForm
                        value={dirtyScenario!}
                        expandedReason={expandedReasonKey}
                        onExpandedReasonChange={setExpandedReasonKey}
                        onHoveredReasonChange={setHoveredReasonKey}
                        isFallback={isFallback}
                        onPreviewChange={setDirtyScenario}
                        onChange={handleScenarioUpdate}
                    />
                </ReportOrderIssueScenarioFormContext.Provider>
            </AutomateViewContent>
            <ReportOrderIssueFlowScenarioPreview
                reasons={dirtyScenario?.newReasons ?? []}
                expandedReasonKey={expandedReasonKey}
                hoveredReasonKey={hoveredReasonKey}
            />
        </AutomateView>
    )
}

export default EditReportOrderIssueFlowScenarioView
