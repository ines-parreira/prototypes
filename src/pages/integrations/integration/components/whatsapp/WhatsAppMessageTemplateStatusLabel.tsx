import React from 'react'
import {WhatsAppMessageTemplateStatus} from 'models/whatsAppMessageTemplates/types'
import Status, {StatusIntent} from 'pages/settings/users/Status'
import useId from 'hooks/useId'
import Tooltip from 'pages/common/components/Tooltip'
import {templateAlertContent} from './constants'

type Props = {
    status: WhatsAppMessageTemplateStatus
    showTooltip?: boolean
}

export default function WhatsAppMessageTemplateStatusLabel({
    status,
    showTooltip,
}: Props) {
    const randomId = useId()

    const {intent, label} = templateStatusToStatusProps[status] ?? {}
    const id = `template-status-${randomId}`

    const alertContent = templateAlertContent[status]

    return (
        <>
            <Status intent={intent} label={label ?? status} id={id} />
            {showTooltip && alertContent?.tooltip && (
                <Tooltip target={id} placement="top">
                    <span>{alertContent.tooltip}</span>{' '}
                    <a
                        href={
                            'https://developers.facebook.com/docs/whatsapp/message-templates/guidelines/'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more
                    </a>
                </Tooltip>
            )}
        </>
    )
}

const templateStatusToStatusProps = {
    [WhatsAppMessageTemplateStatus.Approved]: {
        intent: StatusIntent.Success,
        label: 'Active',
    },
    [WhatsAppMessageTemplateStatus.Rejected]: {
        intent: StatusIntent.Error,
        label: 'Rejected',
    },
    [WhatsAppMessageTemplateStatus.Pending]: {
        intent: StatusIntent.Warning,
        label: 'In review',
    },
    [WhatsAppMessageTemplateStatus.InAppeal]: {
        intent: StatusIntent.Warning,
        label: 'Appeal requested',
    },
    [WhatsAppMessageTemplateStatus.Disabled]: {
        intent: StatusIntent.Error,
        label: 'Disabled',
    },
    [WhatsAppMessageTemplateStatus.Paused]: {
        intent: StatusIntent.Warning,
        label: 'Paused',
    },
    [WhatsAppMessageTemplateStatus.Unsupported]: {
        intent: StatusIntent.Neutral,
        label: 'Unsupported',
    },
}
