import React, {useEffect, useMemo, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import classnames from 'classnames'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import _isEqual from 'lodash/isEqual'

import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import {
    AUTOMATED_RESPONSE,
    ResponseMessageContent,
    SelfServiceConfigurationFilter,
} from 'models/selfServiceConfiguration/types'
import Button from 'pages/common/components/button/Button'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'

import useCancelOrderFlow from './hooks/useCancelOrderFlow'
import CancelOrderEligibility from './components/CancelOrderEligibility'
import CancelOrderResponseMessageContent from './components/CancelOrderResponseMessageContent'
import CancelOrderFlowPreview from './CancelOrderFlowPreview'
import CancelOrderFlowViewContext, {
    CancelOrderFlowViewContextType,
} from './CancelOrderFlowViewContext'
import {DEFAULT_RESPONSE_MESSAGE_CONTENT} from './constants'

import css from './CancelOrderFlowView.less'

const CancelOrderFlowView = () => {
    const {shopName} = useParams<{shopName: string}>()
    const {
        isUpdatePending,
        cancelOrderFlow,
        selfServiceConfiguration,
        handleCancelOrderFlowUpdate,
    } = useCancelOrderFlow(shopName)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    const [errors, setErrors] = useState<Record<string, true>>({})
    const [dirtyCancelOrderFlow, setDirtyCancelOrderFlow] =
        useState(cancelOrderFlow)

    useEffect(() => {
        setDirtyCancelOrderFlow(cancelOrderFlow)
    }, [cancelOrderFlow])

    const hasError = Object.keys(errors).length > 0
    const cancelOrderFlowViewContext: CancelOrderFlowViewContextType = useMemo(
        () => ({
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
        []
    )

    const handleEligibilityChange = (
        eligibility?: SelfServiceConfigurationFilter
    ) => {
        if (!dirtyCancelOrderFlow) {
            return
        }

        setDirtyCancelOrderFlow({
            ...dirtyCancelOrderFlow,
            eligibilities: eligibility ? [eligibility] : [],
        })
    }
    const handleResponseMessageContentChange = (
        responseMessageContent: ResponseMessageContent
    ) => {
        if (!dirtyCancelOrderFlow) {
            return
        }

        setDirtyCancelOrderFlow({
            ...dirtyCancelOrderFlow,
            action: {
                type: AUTOMATED_RESPONSE,
                response_message_content: responseMessageContent,
            },
        })
    }
    const handleSubmit = () => {
        if (!dirtyCancelOrderFlow) {
            return
        }

        void handleCancelOrderFlowUpdate(dirtyCancelOrderFlow)
    }
    const handleCancel = () => {
        setDirtyCancelOrderFlow(cancelOrderFlow)
    }

    const isCancelOrderFlowDirty = !_isEqual(
        dirtyCancelOrderFlow,
        cancelOrderFlow
    )

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
                        <BreadcrumbItem active>Cancel order</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container
                fluid
                className={classnames({
                    [css.container]: Boolean(
                        selfServiceConfiguration && dirtyCancelOrderFlow
                    ),
                })}
            >
                {!selfServiceConfiguration || !dirtyCancelOrderFlow ? (
                    <Loader />
                ) : (
                    <CancelOrderFlowViewContext.Provider
                        value={cancelOrderFlowViewContext}
                    >
                        <div className={css.content}>
                            <div className={css.descriptionContainer}>
                                <div className={css.description}>
                                    Allow customers to request a cancellation if
                                    an order hasn't been processed or shipped.
                                </div>
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

                            <CancelOrderEligibility
                                eligibility={
                                    dirtyCancelOrderFlow.eligibilities[0]
                                }
                                onChange={handleEligibilityChange}
                            />
                            {hasAutomationAddOn && (
                                <CancelOrderResponseMessageContent
                                    responseMessageContent={
                                        dirtyCancelOrderFlow.action
                                            ?.response_message_content ??
                                        DEFAULT_RESPONSE_MESSAGE_CONTENT
                                    }
                                    onChange={
                                        handleResponseMessageContentChange
                                    }
                                />
                            )}

                            <div
                                className={css.submitAndCancelButtonsContainer}
                            >
                                <Button
                                    isDisabled={
                                        !isCancelOrderFlowDirty ||
                                        isUpdatePending ||
                                        hasError
                                    }
                                    onClick={handleSubmit}
                                >
                                    Save changes
                                </Button>
                                <Button
                                    isDisabled={
                                        !isCancelOrderFlowDirty ||
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
                                    isCancelOrderFlowDirty &&
                                    !isUpdatePending &&
                                    !hasError
                                }
                            />
                        </div>
                        <CancelOrderFlowPreview
                            responseMessageContent={
                                dirtyCancelOrderFlow.action
                                    ?.response_message_content
                            }
                        />
                    </CancelOrderFlowViewContext.Provider>
                )}
            </Container>
        </div>
    )
}

export default CancelOrderFlowView
