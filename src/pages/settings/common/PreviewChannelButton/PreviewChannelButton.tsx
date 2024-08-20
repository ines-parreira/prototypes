import React, {useMemo} from 'react'
import {Tooltip} from '@gorgias/ui-kit'

import {TicketChannel} from 'business/types/ticket'
import {logEvent, SegmentEvent} from 'common/segment'
import {SelfServiceChannel} from 'pages/automate/common/hooks/useSelfServiceChannels'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import styles from './PreviewChannelButton.less'

const DEFAULT_CHANNEL_TYPE = 'unknown'

type PreviewChannelButtonProps = {
    url: string
    channel?: SelfServiceChannel
}

const TOOLTIP_TARGET_ID = 'toggle-widgets-edition-button'

const DisableMessage = ({
    id,
    type,
}: {
    id: number
    type: 'help-center' | 'contact-form'
}) => {
    const entityName = type === 'help-center' ? 'Help Center' : 'Contact Form'
    return (
        <span>
            Your {entityName} must be{' '}
            <a href={`/app/settings/${type}/${id}/publish-track`}>published</a>{' '}
            to view it.
        </span>
    )
}

const DisableChatMessage = ({id}: {id: number}) => (
    <span>
        Your chat must be{' '}
        <a href={`/app/settings/channels/gorgias_chat/${id}/installation`}>
            installed
        </a>{' '}
        to view it.
    </span>
)

export const PreviewChannelButton = ({
    url,
    channel,
}: PreviewChannelButtonProps) => {
    const onPreview = () => {
        logEvent(SegmentEvent.PreviewModeClicked, {
            channel: channel?.type ?? DEFAULT_CHANNEL_TYPE,
        })

        const previewWindow = window.open(url, '_blank')

        if (previewWindow) {
            previewWindow.focus()
        }
    }

    const disableMessage = useMemo(() => {
        switch (channel?.type) {
            case TicketChannel.Chat:
                return channel.value.deactivated_datetime ? (
                    <DisableChatMessage id={channel.value.id} />
                ) : null
            case TicketChannel.HelpCenter:
                return channel.value.deactivated_datetime ? (
                    <DisableMessage id={channel.value.id} type="help-center" />
                ) : null
            case TicketChannel.ContactForm:
                return channel.value.deactivated_datetime ? (
                    <DisableMessage id={channel.value.id} type="contact-form" />
                ) : null
            default:
                return null
        }
    }, [channel])

    return (
        <>
            <Tooltip
                placement="bottom"
                target={TOOLTIP_TARGET_ID}
                autohide={false}
            >
                {disableMessage ? (
                    disableMessage
                ) : (
                    <div className={styles.tooltipContainer}>
                        Test your Flows without generating tickets.{' '}
                        <a
                            href="https://docs.gorgias.com/en-US/286870-86c09fc4f4444b289d1a486eb0beba16"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Learn more
                        </a>
                    </div>
                )}
            </Tooltip>

            <Button
                onClick={onPreview}
                id={TOOLTIP_TARGET_ID}
                isDisabled={!!disableMessage}
                data-testid="preview-button"
            >
                <ButtonIconLabel icon="open_in_new" position="right">
                    Test
                </ButtonIconLabel>
            </Button>
        </>
    )
}
