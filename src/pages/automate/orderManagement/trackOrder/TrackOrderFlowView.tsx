import React, {useEffect, useMemo, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import _isEqual from 'lodash/isEqual'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {ResponseMessageContent} from 'models/selfServiceConfiguration/types'
import AutomationView from 'pages/automate/common/components/AutomationView'
import AutomationViewContent from 'pages/automate/common/components/AutomationViewContent'

import {ORDER_MANAGEMENT} from 'pages/automate/common/components/constants'
import UploadingSensitiveInformationDisclaimer from 'pages/automate/common/components/UploadingSensitiveInformationDisclaimer'
import {FeatureFlagKey} from 'config/featureFlags'
import useTrackOrderFlow from './hooks/useTrackOrderFlow'
import TrackOrderUnfulfilledMessage from './components/TrackOrderUnfulfilledMessage'
import TrackOrderFlowPreview from './TrackOrderFlowPreviewTrack'
import TrackOrderFlowViewContext, {
    TrackOrderFlowViewContextType,
} from './TrackOrderFlowViewContext'
import {DEFAULT_UNFULFILLED_MESSAGE} from './constants'

export default function TrackOrderFlowView() {
    const {shopName} = useParams<{shopName: string}>()
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
    const showAttachmentUploadDisclaimer =
        useFlags()[FeatureFlagKey.AutomateShowAttachmentUploadDisclaimer]

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

    const handleUnfulfilledMessageChange = (
        responseMessageContent: ResponseMessageContent
    ) => {
        if (!dirtyTrackOrderFlow) {
            return
        }

        setDirtyTrackOrderFlow({
            ...dirtyTrackOrderFlow,
            unfulfilled_message: responseMessageContent,
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
                    <BreadcrumbItem active>Track order</BreadcrumbItem>
                </Breadcrumb>
            }
            isLoading={isLoading}
        >
            <AutomationViewContent
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
                            dirtyTrackOrderFlow?.unfulfilled_message ??
                            DEFAULT_UNFULFILLED_MESSAGE
                        }
                        onChange={handleUnfulfilledMessageChange}
                    />
                </TrackOrderFlowViewContext.Provider>
                {showAttachmentUploadDisclaimer && (
                    <UploadingSensitiveInformationDisclaimer
                        className="mt-4"
                        message="If you're uploading images, make sure they don't contain sensitive information."
                    />
                )}
            </AutomationViewContent>
            <TrackOrderFlowPreview
                isTextAreaFocused={isTextAreaFocused}
                responseMessageContent={
                    dirtyTrackOrderFlow?.unfulfilled_message
                }
            />
        </AutomationView>
    )
}
