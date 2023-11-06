import React, {useEffect, useMemo, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import _isEqual from 'lodash/isEqual'

import {
    AUTOMATED_RESPONSE,
    ResponseMessageContent,
    SelfServiceConfigurationFilter,
} from 'models/selfServiceConfiguration/types'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import AutomationView from 'pages/automation/common/components/AutomationView'
import AutomationViewContent from 'pages/automation/common/components/AutomationViewContent'

import {ORDER_MANAGEMENT} from 'pages/automation/common/components/constants'
import useCancelOrderFlow from './hooks/useCancelOrderFlow'
import CancelOrderEligibility from './components/CancelOrderEligibility'
import CancelOrderResponseMessageContent from './components/CancelOrderResponseMessageContent'
import CancelOrderFlowPreview from './CancelOrderFlowPreview'
import CancelOrderFlowViewContext, {
    CancelOrderFlowViewContextType,
} from './CancelOrderFlowViewContext'
import {DEFAULT_RESPONSE_MESSAGE_CONTENT} from './constants'

const CancelOrderFlowView = () => {
    const {shopName} = useParams<{shopName: string}>()
    const {
        isUpdatePending,
        storeIntegration,
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
            storeIntegration,
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
        [storeIntegration]
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
    const isLoading = !selfServiceConfiguration || !dirtyCancelOrderFlow

    return (
        <AutomationView
            title={
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link
                            to={`/app/automation/shopify/${shopName}/order-management`}
                        >
                            {ORDER_MANAGEMENT}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>Cancel order</BreadcrumbItem>
                </Breadcrumb>
            }
            isLoading={isLoading}
        >
            <AutomationViewContent
                description="Allow customers to request a cancellation if an order hasn't been processed or shipped."
                helpUrl="https://docs.gorgias.com/en-US/self-service-portal-statuses-81862"
                helpTitle="Learn About Order Statuses In Gorgias"
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmittable={
                    isCancelOrderFlowDirty && !isUpdatePending && !hasError
                }
                isCancelable={isCancelOrderFlowDirty && !isUpdatePending}
            >
                <CancelOrderFlowViewContext.Provider
                    value={cancelOrderFlowViewContext}
                >
                    <CancelOrderEligibility
                        eligibility={dirtyCancelOrderFlow?.eligibilities[0]}
                        onChange={handleEligibilityChange}
                    />
                    {hasAutomationAddOn && (
                        <CancelOrderResponseMessageContent
                            responseMessageContent={
                                dirtyCancelOrderFlow?.action
                                    ?.response_message_content ??
                                DEFAULT_RESPONSE_MESSAGE_CONTENT
                            }
                            onChange={handleResponseMessageContentChange}
                        />
                    )}
                </CancelOrderFlowViewContext.Provider>
            </AutomationViewContent>
            <CancelOrderFlowPreview
                responseMessageContent={
                    dirtyCancelOrderFlow?.action?.response_message_content
                }
            />
        </AutomationView>
    )
}

export default CancelOrderFlowView
