import React, { useCallback } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { Link } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
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
    const renameContactFormEnabled =
        useFlags()[FeatureFlagKey.ChatRenameContactForm]

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
