import React, {useEffect, useMemo, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import classnames from 'classnames'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import _isEqual from 'lodash/isEqual'

import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {IntegrationType} from 'models/integration/constants'
import {
    ReturnAction,
    SelfServiceConfigurationFilter,
} from 'models/selfServiceConfiguration/types'
import Button from 'pages/common/components/button/Button'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import useSelfServiceChannels from 'pages/automation/common/hooks/useSelfServiceChannels'

import ReturnOrderEligibility from './components/ReturnOrderEligibility'
import ReturnOrderAction from './components/ReturnOrderAction'
import ReturnOrderFlowPreview from './ReturnOrderFlowPreview'
import ReturnOrderFlowViewContext, {
    ReturnOrderFlowViewContextType,
} from './ReturnOrderFlowViewContext'
import {DEFAULT_RETURN_ACTION} from './constants'

import css from './ReturnOrderFlowView.less'

const ReturnOrderFlowView = () => {
    const {shopName} = useParams<{shopName: string}>()
    const {
        isUpdatePending,
        storeIntegration,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(IntegrationType.Shopify, shopName)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const channels = useSelfServiceChannels(IntegrationType.Shopify, shopName)

    const returnOrderFlow = selfServiceConfiguration?.return_order_policy

    const [errors, setErrors] = useState<Record<string, true>>({})
    const [dirtyReturnOrderFlow, setDirtyReturnOrderFlow] =
        useState(returnOrderFlow)

    useEffect(() => {
        setDirtyReturnOrderFlow(returnOrderFlow)
    }, [returnOrderFlow])

    const hasError = Object.keys(errors).length > 0
    const returnOrderFlowViewContext: ReturnOrderFlowViewContextType = useMemo(
        () => ({
            storeIntegrationName: storeIntegration?.name ?? '',
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
        [storeIntegration?.name]
    )

    const handleEligibilityChange = (
        eligibility?: SelfServiceConfigurationFilter
    ) => {
        if (!dirtyReturnOrderFlow) {
            return
        }

        setDirtyReturnOrderFlow({
            ...dirtyReturnOrderFlow,
            eligibilities: eligibility ? [eligibility] : [],
        })
    }
    const handleActionChange = (action: ReturnAction) => {
        if (!dirtyReturnOrderFlow) {
            return
        }

        setDirtyReturnOrderFlow({...dirtyReturnOrderFlow, action})
    }
    const handleSubmit = () => {
        if (!selfServiceConfiguration || !dirtyReturnOrderFlow) {
            return
        }

        void handleSelfServiceConfigurationUpdate({
            ...selfServiceConfiguration,
            return_order_policy: dirtyReturnOrderFlow,
        })
    }
    const handleCancel = () => {
        setDirtyReturnOrderFlow(returnOrderFlow)
    }

    const isReturnOrderFlowDirty = !_isEqual(
        dirtyReturnOrderFlow,
        returnOrderFlow
    )
    const dirtyReturnAction =
        dirtyReturnOrderFlow?.action ?? DEFAULT_RETURN_ACTION

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
                        <BreadcrumbItem active>Return order</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container
                fluid
                className={classnames({
                    [css.container]: Boolean(
                        selfServiceConfiguration && dirtyReturnOrderFlow
                    ),
                })}
            >
                {!selfServiceConfiguration || !dirtyReturnOrderFlow ? (
                    <Loader />
                ) : (
                    <ReturnOrderFlowViewContext.Provider
                        value={returnOrderFlowViewContext}
                    >
                        <div>
                            <div className={css.descriptionContainer}>
                                <p className="mb-1">
                                    Allow customers to request a return if an
                                    order has been delivered.
                                </p>
                                <a
                                    href="https://docs.gorgias.com/en-US/self-service-portal-statuses-81862"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <i className="material-icons mr-2">
                                        menu_book
                                    </i>
                                    Learn About Order Statuses In Gorgias
                                </a>
                            </div>

                            <ReturnOrderEligibility
                                eligibility={
                                    dirtyReturnOrderFlow?.eligibilities[0]
                                }
                                onChange={handleEligibilityChange}
                            />
                            {hasAutomationAddOn && (
                                <ReturnOrderAction
                                    action={dirtyReturnAction}
                                    onChange={handleActionChange}
                                />
                            )}

                            <div
                                className={css.submitAndCancelButtonsContainer}
                            >
                                <Button
                                    isDisabled={
                                        !isReturnOrderFlowDirty ||
                                        isUpdatePending ||
                                        hasError
                                    }
                                    onClick={handleSubmit}
                                >
                                    Save changes
                                </Button>
                                <Button
                                    isDisabled={
                                        !isReturnOrderFlowDirty ||
                                        isUpdatePending
                                    }
                                    onClick={handleCancel}
                                    intent="secondary"
                                >
                                    Cancel
                                </Button>
                            </div>
                            <UnsavedChangesPrompt
                                onSave={handleSubmit}
                                when={
                                    isReturnOrderFlowDirty &&
                                    !isUpdatePending &&
                                    !hasError
                                }
                            />
                        </div>
                        <ReturnOrderFlowPreview
                            channels={channels}
                            returnAction={dirtyReturnAction}
                        />
                    </ReturnOrderFlowViewContext.Provider>
                )}
            </Container>
        </div>
    )
}

export default ReturnOrderFlowView
