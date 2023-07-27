import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {FeatureFlagKey} from 'config/featureFlags'
import Tooltip from 'pages/common/components/Tooltip'
import {
    logEvent,
    SegmentEvent,
} from '../../../../store/middlewares/segmentTracker'
import {SelfServiceChannel} from '../../../automation/common/hooks/useSelfServiceChannels'
import styles from './PreviewChannelButton.less'

const DEFAULT_CHANNEL_TYPE = 'unknown'

type PreviewChannelButtonProps = {
    url: string
    channel?: SelfServiceChannel
}

const TOOLTIP_TARGET_ID = 'toggle-widgets-edition-button'

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
        <>
            <Tooltip
                placement="bottom"
                target={TOOLTIP_TARGET_ID}
                autohide={false}
            >
                <div className={styles.tooltipContainer}>
                    Test your flows without generating tickets.{' '}
                    <a
                        href="https://docs.gorgias.com/en-US/286870-86c09fc4f4444b289d1a486eb0beba16"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more
                    </a>
                </div>
            </Tooltip>

            <Button
                fillStyle="ghost"
                intent="secondary"
                onClick={onPreview}
                id={TOOLTIP_TARGET_ID}
            >
                <ButtonIconLabel icon="open_in_new">
                    Try it live
                </ButtonIconLabel>
            </Button>
        </>
    ) : null
}
