import React, {useState, useEffect, useMemo, useRef} from 'react'
import {createMemoryHistory} from 'history'

import {
    PolicyKey,
    ResponseMessageContent,
} from 'models/selfServiceConfiguration/types'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import SelfServicePreviewContext from 'pages/automation/common/components/preview/SelfServicePreviewContext'
import SelfServicePreview from 'pages/automation/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automation/common/components/preview/SelfServicePreviewContainer'
import {SELF_SERVICE_PREVIEW_ROUTES} from 'pages/automation/common/components/preview/constants'

import {useOrderManagementPreviewContext} from '../OrderManagementPreviewContext'

import css from './TrackOrderFlowPreviewTrack.less'

type Props = {
    responseMessageContent?: ResponseMessageContent
    isTextAreaFocused?: boolean
}

export default function TrackOrderFlowPreview({
    responseMessageContent,
    isTextAreaFocused,
}: Props) {
    const [isTrackOrderPreviewPlaying, setIsTrackOrderPreviewPlaying] =
        useState(true)
    const [policyKey, setPolicyKey] = useState<PolicyKey>('track_order_policy')
    const [currentLocation, setCurrentLocation] = useState<
        typeof SELF_SERVICE_PREVIEW_ROUTES[keyof typeof SELF_SERVICE_PREVIEW_ROUTES]
    >(SELF_SERVICE_PREVIEW_ROUTES.ORDERS)
    const previousLocation = useRef(currentLocation)

    useEffect(() => {
        previousLocation.current = currentLocation
    }, [currentLocation])

    const history = useMemo(
        () =>
            createMemoryHistory({
                initialEntries: [SELF_SERVICE_PREVIEW_ROUTES.ORDERS],
            }),
        []
    )

    useEffect(() => {
        const unregister = history.listen((location) => {
            setCurrentLocation(
                location.pathname as typeof SELF_SERVICE_PREVIEW_ROUTES[keyof typeof SELF_SERVICE_PREVIEW_ROUTES]
            )
        })

        return () => {
            setIsTrackOrderPreviewPlaying(false)
            unregister()
        }
    }, [history])

    useEffect(() => {
        if (
            currentLocation === SELF_SERVICE_PREVIEW_ROUTES.TRACK ||
            (currentLocation === SELF_SERVICE_PREVIEW_ROUTES.ORDERS &&
                policyKey === 'track_order_policy')
        ) {
            if (
                previousLocation.current === SELF_SERVICE_PREVIEW_ROUTES.TRACK
            ) {
                setPolicyKey('report_issue_policy')
                setIsTrackOrderPreviewPlaying(false)
            } else {
                setIsTrackOrderPreviewPlaying(true)
            }
        } else {
            setIsTrackOrderPreviewPlaying(false)
        }
    }, [
        currentLocation,
        policyKey,
        isTrackOrderPreviewPlaying,
        previousLocation,
    ])

    useEffect(() => {
        if (isTextAreaFocused) {
            history.push(SELF_SERVICE_PREVIEW_ROUTES.TRACK_UNFULFILLED_MESSAGE)
        } else {
            if (
                currentLocation ===
                SELF_SERVICE_PREVIEW_ROUTES.TRACK_UNFULFILLED_MESSAGE
            ) {
                history.push(SELF_SERVICE_PREVIEW_ROUTES.ORDERS)
                setPolicyKey('report_issue_policy')
            }
        }
    }, [
        policyKey,
        isTextAreaFocused,
        history,
        isTrackOrderPreviewPlaying,
        currentLocation,
    ])

    const handleTrackOrderPreviewClick = () => {
        history.push(SELF_SERVICE_PREVIEW_ROUTES.ORDERS)
        setPolicyKey('track_order_policy')
    }

    const {channels, channel, onChannelChange} =
        useOrderManagementPreviewContext()

    const shouldDisplayPreviewButton = useMemo(
        () =>
            !isTrackOrderPreviewPlaying &&
            currentLocation === SELF_SERVICE_PREVIEW_ROUTES.ORDERS,
        [isTrackOrderPreviewPlaying, currentLocation]
    )

    return (
        <SelfServicePreviewContainer
            channels={channels}
            channel={channel}
            onChange={onChannelChange}
            alert={{
                message:
                    'Connect a Chat or Help Center to your store to use this feature.',
            }}
        >
            {(channel) => (
                <SelfServicePreviewContext.Provider
                    value={{
                        automatedResponseMessageContent: responseMessageContent,
                        orderManagementFlow: policyKey,
                    }}
                >
                    <div className={css.previewContainer}>
                        {shouldDisplayPreviewButton && (
                            <Button
                                className={css.previewButton}
                                onClick={handleTrackOrderPreviewClick}
                                fillStyle="ghost"
                            >
                                <ButtonIconLabel icon="play_circle_filled">
                                    Preview
                                </ButtonIconLabel>
                            </Button>
                        )}
                        <div
                            style={{
                                opacity: shouldDisplayPreviewButton ? 0.4 : 1,
                            }}
                        >
                            <SelfServicePreview
                                channel={channel}
                                history={history}
                            />
                        </div>
                    </div>
                </SelfServicePreviewContext.Provider>
            )}
        </SelfServicePreviewContainer>
    )
}
