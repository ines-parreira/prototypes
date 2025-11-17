import type { PhoneIntegration } from '@gorgias/helpdesk-types'

import { PHONE_INTEGRATION_BASE_URL } from './constants'

import css from './VoiceIntegrationSelectCaption.less'

type Props = {
    integration?: PhoneIntegration | null
}

export function VoiceIntegrationSelectCaption({ integration }: Props) {
    return (
        <div className={css.container}>
            The integration settings apply automatically. View or adjust them{' '}
            {integration ? (
                <a
                    href={`${PHONE_INTEGRATION_BASE_URL}/${integration.id}/flow`}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    here
                </a>
            ) : (
                <>
                    in{' '}
                    <a
                        href={`${PHONE_INTEGRATION_BASE_URL}/integrations`}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        Voice integrations
                    </a>
                </>
            )}
            .
        </div>
    )
}
