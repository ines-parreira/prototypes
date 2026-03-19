import React, { useEffect, useMemo, useState } from 'react'

import _isEqual from 'lodash/isEqual'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type {
    ResponseMessageContent,
    SelfServiceConfigurationFilter,
} from 'models/selfServiceConfiguration/types'
import { AUTOMATED_RESPONSE } from 'models/selfServiceConfiguration/types'
import AutomateView from 'pages/automate/common/components/AutomateView'
import AutomateViewContent from 'pages/automate/common/components/AutomateViewContent'
import { ORDER_MANAGEMENT } from 'pages/automate/common/components/constants'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import CancelOrderFlowPreview from './CancelOrderFlowPreview'
import type { CancelOrderFlowViewContextType } from './CancelOrderFlowViewContext'
import CancelOrderFlowViewContext from './CancelOrderFlowViewContext'
import CancelOrderEligibility from './components/CancelOrderEligibility'
import CancelOrderResponseMessageContent from './components/CancelOrderResponseMessageContent'
import { DEFAULT_RESPONSE_MESSAGE_CONTENT } from './constants'
import useCancelOrderFlow from './hooks/useCancelOrderFlow'

const CancelOrderFlowView = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const {
        isUpdatePending,
        storeIntegration,
        cancelOrderFlow,
        selfServiceConfiguration,
        handleCancelOrderFlowUpdate,
    } = useCancelOrderFlow(shopName)
    const { hasAccess } = useAiAgentAccess(shopName)
    const isAutomateSettings = useIsAutomateSettings()

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
        }),
        [storeIntegration],
    )

    const handleEligibilityChange = (
        eligibility?: SelfServiceConfigurationFilter,
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
        responseMessageContent: ResponseMessageContent,
    ) => {
        if (!dirtyCancelOrderFlow) {
            return
        }

        setDirtyCancelOrderFlow({
            ...dirtyCancelOrderFlow,
            action: {
                type: AUTOMATED_RESPONSE,
                responseMessageContent,
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
        cancelOrderFlow,
    )
    const isLoading = !selfServiceConfiguration || !dirtyCancelOrderFlow

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
                        <BreadcrumbItem active>Cancel order</BreadcrumbItem>
                    </Breadcrumb>
                )
            }
            isLoading={isLoading}
        >
            <AutomateViewContent
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
                    {hasAccess && (
                        <CancelOrderResponseMessageContent
                            responseMessageContent={
                                dirtyCancelOrderFlow?.action
                                    ?.responseMessageContent ??
                                DEFAULT_RESPONSE_MESSAGE_CONTENT
                            }
                            onChange={handleResponseMessageContentChange}
                        />
                    )}
                </CancelOrderFlowViewContext.Provider>
            </AutomateViewContent>
            <CancelOrderFlowPreview
                responseMessageContent={
                    dirtyCancelOrderFlow?.action?.responseMessageContent
                }
            />
        </AutomateView>
    )
}

export default CancelOrderFlowView
