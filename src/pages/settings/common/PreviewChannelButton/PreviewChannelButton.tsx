import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    logEvent,
    SegmentEvent,
} from '../../../../store/middlewares/segmentTracker'
import {SelfServiceChannel} from '../../../automation/common/hooks/useSelfServiceChannels'

const DEFAULT_CHANNEL_TYPE = 'unknown'

type PreviewChannelButtonProps = {
    url: string
    channel?: SelfServiceChannel
}

export const PreviewChannelButton = ({
    url,
    channel,
}: PreviewChannelButtonProps) => {
    const isAAOPreviewModeEnabled = useFlags()[FeatureFlagKey.AAOPreviewMode]

    const onPreview = () => {
        logEvent(SegmentEvent.PreviewModeClicked, {
            channel: channel?.type ?? DEFAULT_CHANNEL_TYPE,
        })

        const previewWindow = window.open(url, '_blank')

        if (previewWindow) {
            previewWindow.focus()
        }
    }

    return isAAOPreviewModeEnabled ? (
        <Button fillStyle="ghost" intent="secondary" onClick={onPreview}>
            <ButtonIconLabel icon="open_in_new">Try it live</ButtonIconLabel>
        </Button>
    ) : null
}
