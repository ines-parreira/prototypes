import React, {useMemo, useRef, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import classnames from 'classnames'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import _isEqual from 'lodash/isEqual'

import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {ReportIssueCaseReason} from 'models/selfServiceConfiguration/types'

import useReportOrderIssueFlowScenario from './hooks/useReportOrderIssueFlowScenario'
import ReportOrderIssueScenarioForm from './components/ReportOrderIssueScenarioForm'
import ReportOrderIssueScenarioFormContext, {
    ReportOrderIssueScenarioFormContextType,
} from './components/ReportOrderIssueScenarioFormContext'
import ReportOrderIssueFlowScenarioPreview from './ReportOrderIssueFlowScenarioPreview'

import css from './EditReportOrderIssueFlowScenarioView.less'

const EditReportOrderIssueFlowScenarioView = () => {
    const {shopName, scenarioIndex} =
        useParams<{shopName: string; scenarioIndex: string}>()
    const {
        isUpdatePending,
        isFallback,
        scenario,
        selfServiceConfiguration,
        handleScenarioUpdate,
        handleScenarioDelete,
    } = useReportOrderIssueFlowScenario(shopName, parseInt(scenarioIndex, 10))

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
                        const nextErrors = {...prevErrors}

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
            }),
            [isUpdatePending, errors, hasError]
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

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/automation/shopify/${shopName}/order-management`}
                            >
                                Order management
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
                }
            />
            <Container
                fluid
                className={classnames({
                    [css.container]: Boolean(
                        selfServiceConfiguration && dirtyScenario
                    ),
                })}
            >
                {!selfServiceConfiguration || !dirtyScenario ? (
                    <Loader />
                ) : (
                    <>
                        <div className={css.content}>
                            <ReportOrderIssueScenarioFormContext.Provider
                                value={reportOrderIssueScenarioFormContext}
                            >
                                <ReportOrderIssueScenarioForm
                                    value={dirtyScenario}
                                    expandedReason={expandedReasonKey}
                                    onExpandedReasonChange={
                                        setExpandedReasonKey
                                    }
                                    onHoveredReasonChange={setHoveredReasonKey}
                                    isFallback={isFallback}
                                    onPreviewChange={setDirtyScenario}
                                    onChange={handleScenarioUpdate}
                                />
                                <div className={css.buttonsContainer}>
                                    <Button
                                        isDisabled={
                                            !isScenarioDirty ||
                                            isUpdatePending ||
                                            hasError
                                        }
                                        onClick={handleSubmit}
                                    >
                                        Save changes
                                    </Button>
                                    <Button
                                        isDisabled={
                                            !isScenarioDirty || isUpdatePending
                                        }
                                        onClick={handleCancel}
                                        intent="secondary"
                                    >
                                        Cancel
                                    </Button>
                                    {!isFallback && (
                                        <ConfirmButton
                                            className={css.deleteButton}
                                            confirmationButtonIntent="destructive"
                                            confirmationContent="Deleting this scenario cannot be undone."
                                            confirmationTitle={
                                                <b>Delete scenario?</b>
                                            }
                                            confirmLabel="Delete"
                                            fillStyle="ghost"
                                            intent="destructive"
                                            onConfirm={handleScenarioDelete}
                                            placement="top"
                                            showCancelButton
                                            isDisabled={isUpdatePending}
                                        >
                                            <ButtonIconLabel icon="delete">
                                                Delete Scenario
                                            </ButtonIconLabel>
                                        </ConfirmButton>
                                    )}
                                    <UnsavedChangesPrompt
                                        onSave={handleSubmit}
                                        when={
                                            isScenarioDirty &&
                                            !isUpdatePending &&
                                            !hasError
                                        }
                                    />
                                </div>
                            </ReportOrderIssueScenarioFormContext.Provider>
                        </div>
                        <ReportOrderIssueFlowScenarioPreview
                            reasons={dirtyScenario.reasons}
                            expandedReasonKey={expandedReasonKey}
                            hoveredReasonKey={hoveredReasonKey}
                        />
                    </>
                )}
            </Container>
        </div>
    )
}

export default EditReportOrderIssueFlowScenarioView
