import React from 'react'
import {WhatsAppTemplateStatus} from 'models/integration/types'
import Status, {StatusIntent} from 'pages/settings/users/Status'

type Props = {
    status: WhatsAppTemplateStatus
}

export default function WhatsAppTemplateStatusLabel({status}: Props) {
    const {intent, label} = templateStatusToStatusProps[status]

    return <Status intent={intent} label={label} />
}

const templateStatusToStatusProps = {
    [WhatsAppTemplateStatus.Approved]: {
        intent: StatusIntent.Success,
        label: 'Active',
    },
    [WhatsAppTemplateStatus.Rejected]: {
        intent: StatusIntent.Error,
        label: 'Rejected',
    },
    [WhatsAppTemplateStatus.Pending]: {
        intent: StatusIntent.Warning,
        label: 'In review',
    },
    [WhatsAppTemplateStatus.InAppeal]: {
        intent: StatusIntent.Warning,
        label: 'Appeal requested',
    },
    [WhatsAppTemplateStatus.Disabled]: {
        intent: StatusIntent.Error,
        label: 'Disabled',
    },
    [WhatsAppTemplateStatus.Paused]: {
        intent: StatusIntent.Warning,
        label: 'Paused',
    },
    [WhatsAppTemplateStatus.Unsupported]: {
        intent: StatusIntent.Neutral,
        label: 'Unsupported',
    },
}
