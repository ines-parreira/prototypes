import React, { useEffect, useMemo, useState } from 'react'

import _isEqual from 'lodash/isEqual'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import type { ResponseMessageContent } from 'models/selfServiceConfiguration/types'
import AutomateView from 'pages/automate/common/components/AutomateView'
import AutomateViewContent from 'pages/automate/common/components/AutomateViewContent'
import { ORDER_MANAGEMENT } from 'pages/automate/common/components/constants'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import TrackOrderUnfulfilledMessage from './components/TrackOrderUnfulfilledMessage'
import { DEFAULT_UNFULFILLED_MESSAGE } from './constants'
import useTrackOrderFlow from './hooks/useTrackOrderFlow'
import TrackOrderFlowPreview from './TrackOrderFlowPreviewTrack'
import type { TrackOrderFlowViewContextType } from './TrackOrderFlowViewContext'
import TrackOrderFlowViewContext from './TrackOrderFlowViewContext'

export default function TrackOrderFlowView() {
    const { shopName } = useParams<{ shopName: string }>()
    const {
        isUpdatePending,
        storeIntegration,
        trackOrderFlow,
        selfServiceConfiguration,
        handleTrackOrderFlowUpdate,
    } = useTrackOrderFlow(shopName)
    const [errors, setErrors] = useState<Record<string, true>>({})
    const [dirtyTrackOrderFlow, setDirtyTrackOrderFlow] =
        useState(trackOrderFlow)
    const isAutomateSettings = useIsAutomateSettings()

    useEffect(() => {
        setDirtyTrackOrderFlow(trackOrderFlow)
    }, [trackOrderFlow])

    const hasError = Object.keys(errors).length > 0
    const [isTextAreaFocused, setIsTextAreaFocused] = useState(false)
    const trackOrderFlowViewContext: TrackOrderFlowViewContextType = useMemo(
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

    const handleUnfulfilledMessageChange = (
        responseMessageContent: ResponseMessageContent,
    ) => {
        if (!dirtyTrackOrderFlow) {
            return
        }

        setDirtyTrackOrderFlow({
            ...dirtyTrackOrderFlow,
            unfulfilledMessage: responseMessageContent,
        })
    }
    const handleSubmit = () => {
        if (!dirtyTrackOrderFlow) {
            return
        }

        void handleTrackOrderFlowUpdate(dirtyTrackOrderFlow)
    }
    const handleCancel = () => {
        setDirtyTrackOrderFlow(trackOrderFlow)
    }

    const isTrackOrderFlowDirty = !_isEqual(dirtyTrackOrderFlow, trackOrderFlow)

    const isLoading = !selfServiceConfiguration || !dirtyTrackOrderFlow

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
                        <BreadcrumbItem active>Track order</BreadcrumbItem>
                    </Breadcrumb>
                )
            }
            isLoading={isLoading}
        >
            <AutomateViewContent
                description="Allow customers to track the status of their order."
                helpUrl="https://docs.gorgias.com/en-US/self-service-portal-statuses-81862"
                helpTitle="Learn About Order Statuses In Gorgias"
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmittable={
                    isTrackOrderFlowDirty && !isUpdatePending && !hasError
                }
                isCancelable={isTrackOrderFlowDirty && !isUpdatePending}
            >
                <TrackOrderFlowViewContext.Provider
                    value={trackOrderFlowViewContext}
                >
                    <TrackOrderUnfulfilledMessage
                        setIsFocused={setIsTextAreaFocused}
                        responseMessageContent={
                            dirtyTrackOrderFlow?.unfulfilledMessage ??
                            DEFAULT_UNFULFILLED_MESSAGE
                        }
                        onChange={handleUnfulfilledMessageChange}
                    />
                </TrackOrderFlowViewContext.Provider>
            </AutomateViewContent>
            <TrackOrderFlowPreview
                isTextAreaFocused={isTextAreaFocused}
                responseMessageContent={dirtyTrackOrderFlow?.unfulfilledMessage}
            />
        </AutomateView>
    )
}
