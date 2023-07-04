import React from 'react'
import {WhatsAppMessageTemplateStatus} from 'models/whatsAppMessageTemplates/types'
import Status, {StatusIntent} from 'pages/settings/users/Status'

type Props = {
    status: WhatsAppMessageTemplateStatus
}

export default function WhatsAppMessageTemplateStatusLabel({status}: Props) {
    const {intent, label} = templateStatusToStatusProps[status] ?? {}

    return <Status intent={intent} label={label ?? status} />
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
