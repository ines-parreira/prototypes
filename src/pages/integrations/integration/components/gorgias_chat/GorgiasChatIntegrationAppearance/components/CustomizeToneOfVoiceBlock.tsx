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
                Customize tone of voice
            </Link>
        }
    >
        <div>
            Customize tone of voice by editing messages, contact form subjects,
            and more.
        </div>
    </Alert>
)
