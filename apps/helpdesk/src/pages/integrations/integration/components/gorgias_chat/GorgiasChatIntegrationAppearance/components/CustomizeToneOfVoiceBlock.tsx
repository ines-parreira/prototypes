import { useCallback } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { Link } from 'react-router-dom'

import Alert, { AlertType } from 'pages/common/components/Alert/Alert'

import css from '../GorgiasChatIntegrationAppearance.less'

type Props = {
    integrationId: number
}

export const CustomizeToneOfVoiceBlock = ({ integrationId }: Props) => {
    const onClickLink = useCallback(() => {
        logEvent(
            SegmentEvent.ChatSettingsToneOfVoiceLinkClicked,
            (integrationId && { id: integrationId }) || {},
        )
    }, [integrationId])
    const renameContactFormEnabled = useFlag(
        FeatureFlagKey.ChatRenameContactForm,
    )

    return (
        <Alert
            className="mb-4"
            type={AlertType.Info}
            icon
            customActions={
                <Link
                    to={`/app/settings/channels/gorgias_chat/${integrationId}/appearance/texts`}
                    className={css.actionLink}
                    onClick={onClickLink}
                >
                    Customize Copy
                </Link>
            }
        >
            <div>
                Customize copy for labels, automated messages, and{' '}
                {renameContactFormEnabled ? 'offline capture' : 'contact form'}{' '}
                subjects to match your tone of voice.
            </div>
        </Alert>
    )
}
