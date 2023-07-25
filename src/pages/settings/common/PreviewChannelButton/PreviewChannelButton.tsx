import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {FeatureFlagKey} from 'config/featureFlags'

type PreviewChannelButtonProps = {
    url: string
}

export const PreviewChannelButton = ({url}: PreviewChannelButtonProps) => {
    const isAAOPreviewModeEnabled = useFlags()[FeatureFlagKey.AAOPreviewMode]

    const onPreview = () => {
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
