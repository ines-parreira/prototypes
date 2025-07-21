import { Tooltip } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'
import { WhatsAppMessageTemplateStatus } from 'models/whatsAppMessageTemplates/types'
import Status, { StatusType } from 'pages/common/components/Status/Status'

import { templateAlertContent } from './constants'

type Props = {
    status: WhatsAppMessageTemplateStatus
    showTooltip?: boolean
}

export default function WhatsAppMessageTemplateStatusLabel({
    status,
    showTooltip,
}: Props) {
    const randomId = useId()

    const { intent, label } = templateStatusToStatusProps[status] ?? {}
    const id = `template-status-${randomId}`

    const alertContent = templateAlertContent[status]

    return (
        <>
            <Status type={intent} id={id}>
                {label ?? status}
            </Status>
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
        intent: StatusType.Success,
        label: 'Active',
    },
    [WhatsAppMessageTemplateStatus.Rejected]: {
        intent: StatusType.Error,
        label: 'Rejected',
    },
    [WhatsAppMessageTemplateStatus.Pending]: {
        intent: StatusType.Warning,
        label: 'In review',
    },
    [WhatsAppMessageTemplateStatus.InAppeal]: {
        intent: StatusType.Warning,
        label: 'Appeal requested',
    },
    [WhatsAppMessageTemplateStatus.Disabled]: {
        intent: StatusType.Error,
        label: 'Disabled',
    },
    [WhatsAppMessageTemplateStatus.Paused]: {
        intent: StatusType.Warning,
        label: 'Paused',
    },
    [WhatsAppMessageTemplateStatus.Unsupported]: {
        intent: StatusType.Info,
        label: 'Unsupported',
    },
}
