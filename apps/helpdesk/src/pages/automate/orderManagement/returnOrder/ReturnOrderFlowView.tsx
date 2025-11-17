import React, { useEffect, useMemo, useState } from 'react'

import _isEqual from 'lodash/isEqual'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type {
    ReturnAction,
    SelfServiceConfigurationFilter,
} from 'models/selfServiceConfiguration/types'
import AutomateView from 'pages/automate/common/components/AutomateView'
import AutomateViewContent from 'pages/automate/common/components/AutomateViewContent'
import { ORDER_MANAGEMENT } from 'pages/automate/common/components/constants'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import ReturnOrderAction from './components/ReturnOrderAction'
import ReturnOrderEligibility from './components/ReturnOrderEligibility'
import { DEFAULT_RETURN_ACTION } from './constants'
import useReturnOrderFlow from './hooks/useReturnOrderFlow'
import ReturnOrderFlowPreview from './ReturnOrderFlowPreview'
import type { ReturnOrderFlowViewContextType } from './ReturnOrderFlowViewContext'
import ReturnOrderFlowViewContext from './ReturnOrderFlowViewContext'

const ReturnOrderFlowView = () => {
    const { shopName } = useParams<{ shopName: string }>()
    const {
        isUpdatePending,
        storeIntegration,
        returnOrderFlow,
        selfServiceConfiguration,
        handleReturnOrderFlowUpdate,
    } = useReturnOrderFlow(shopName)
    const { hasAccess } = useAiAgentAccess(shopName)
    const isAutomateSettings = useIsAutomateSettings()

    const [errors, setErrors] = useState<Record<string, true>>({})
    const [dirtyReturnOrderFlow, setDirtyReturnOrderFlow] =
        useState(returnOrderFlow)

    useEffect(() => {
        setDirtyReturnOrderFlow(returnOrderFlow)
    }, [returnOrderFlow])

    const hasError = Object.keys(errors).length > 0
    const returnOrderFlowViewContext: ReturnOrderFlowViewContextType = useMemo(
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

        setDirtyReturnOrderFlow({ ...dirtyReturnOrderFlow, action })
    }
    const handleSubmit = () => {
        if (!dirtyReturnOrderFlow) {
            return
        }

        void handleReturnOrderFlowUpdate(dirtyReturnOrderFlow)
    }
    const handleCancel = () => {
        setDirtyReturnOrderFlow(returnOrderFlow)
    }

    const isReturnOrderFlowDirty = !_isEqual(
        dirtyReturnOrderFlow,
        returnOrderFlow,
    )
    const dirtyReturnAction =
        dirtyReturnOrderFlow?.action ?? DEFAULT_RETURN_ACTION
    const isLoading = !selfServiceConfiguration || !dirtyReturnOrderFlow

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
                        <BreadcrumbItem active>Return order</BreadcrumbItem>
                    </Breadcrumb>
                )
            }
            isLoading={isLoading}
        >
            <AutomateViewContent
                description="Allow customers to request a return if an order has been delivered."
                helpUrl="https://docs.gorgias.com/en-US/self-service-portal-statuses-81862"
                helpTitle="Learn About Order Statuses In Gorgias"
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmittable={
                    isReturnOrderFlowDirty && !isUpdatePending && !hasError
                }
                isCancelable={isReturnOrderFlowDirty && !isUpdatePending}
            >
                <ReturnOrderFlowViewContext.Provider
                    value={returnOrderFlowViewContext}
                >
                    <ReturnOrderEligibility
                        eligibility={dirtyReturnOrderFlow?.eligibilities[0]}
                        onChange={handleEligibilityChange}
                    />
                    {hasAccess && (
                        <ReturnOrderAction
                            action={dirtyReturnAction}
                            onChange={handleActionChange}
                        />
                    )}
                </ReturnOrderFlowViewContext.Provider>
            </AutomateViewContent>
            <ReturnOrderFlowPreview returnAction={dirtyReturnAction} />
        </AutomateView>
    )
}

export default ReturnOrderFlowView
