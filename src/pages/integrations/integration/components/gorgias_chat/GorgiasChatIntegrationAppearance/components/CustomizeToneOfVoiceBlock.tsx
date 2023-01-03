import React from 'react'
import {Link} from 'react-router-dom'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import css from '../GorgiasChatIntegrationAppearance.less'

type Props = {
    integrationId: number
}

export const CustomizeToneOfVoiceBlock = ({integrationId}: Props) => (
    <Alert
        className="mb-4"
        type={AlertType.Info}
        icon
        customActions={
            <Link
                to={`/app/settings/channels/gorgias_chat/${integrationId}/appearance/texts`}
                className={css.actionLink}
            >
                Customize Copy
            </Link>
        }
    >
        <div>
            Customize copy for labels, automated messages, and contact form
            subjects to match your tone of voice.
        </div>
    </Alert>
)
