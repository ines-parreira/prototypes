import React, {useMemo, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import classnames from 'classnames'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import _isEqual from 'lodash/isEqual'

import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import Button from 'pages/common/components/button/Button'
import {SelfServiceReportIssueCase} from 'models/selfServiceConfiguration/types'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'

import useReportOrderIssueFlowScenarios from './hooks/useReportOrderIssueFlowScenarios'
import ReportOrderIssueScenarioForm from './components/ReportOrderIssueScenarioForm'
import ReportOrderIssueScenarioFormContext, {
    ReportOrderIssueScenarioFormContextType,
} from './components/ReportOrderIssueScenarioFormContext'
import {DEFAULT_SCENARIO} from './constants'

import css from './CreateReportOrderIssueFlowScenarioView.less'

const CreateReportOrderIssueFlowScenarioView = () => {
    const {shopName} = useParams<{shopName: string}>()
    const {isCreatePending, selfServiceConfiguration, handleScenarioCreate} =
        useReportOrderIssueFlowScenarios(shopName)

    const [errors, setErrors] = useState<Record<string, true>>({})
    const [scenario, setScenario] =
        useState<SelfServiceReportIssueCase>(DEFAULT_SCENARIO)

    const hasError = Object.keys(errors).length > 0
    const reportOrderIssueScenarioFormContext: ReportOrderIssueScenarioFormContextType =
        useMemo(
            () => ({
                isUpdatePending: isCreatePending,
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
            [isCreatePending, errors, hasError]
        )

    const handleSubmit = () => {
        void handleScenarioCreate(scenario)
    }
    const handleCancel = () => {
        setScenario(DEFAULT_SCENARIO)
    }

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
                        <BreadcrumbItem active>Create scenario</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container
                fluid
                className={classnames({
                    [css.container]: Boolean(selfServiceConfiguration),
                })}
            >
                {!selfServiceConfiguration ? (
                    <Loader />
                ) : (
                    <div>
                        <ReportOrderIssueScenarioFormContext.Provider
                            value={reportOrderIssueScenarioFormContext}
                        >
                            <ReportOrderIssueScenarioForm
                                value={scenario}
                                isFallback={false}
                                onPreviewChange={setScenario}
                                onChange={setScenario}
                            />
                            <div className={css.buttonsContainer}>
                                <Button
                                    isDisabled={isCreatePending || hasError}
                                    onClick={handleSubmit}
                                >
                                    Create scenario
                                </Button>
                                <Button
                                    isDisabled={isCreatePending}
                                    onClick={handleCancel}
                                    intent="secondary"
                                >
                                    Cancel
                                </Button>
                            </div>
                            <UnsavedChangesPrompt
                                onSave={handleSubmit}
                                when={!hasError && !isCreatePending}
                            />
                        </ReportOrderIssueScenarioFormContext.Provider>
                    </div>
                )}
            </Container>
        </div>
    )
}

export default CreateReportOrderIssueFlowScenarioView
