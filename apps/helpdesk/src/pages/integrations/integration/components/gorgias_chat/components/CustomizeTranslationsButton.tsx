import { useHistory } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

export const CustomizeTranslationsButton = ({
    integrationId,
    isDisabled,
}: {
    integrationId: number
    isDisabled?: boolean
}) => {
    const history = useHistory()

    return (
        <Button
            isDisabled={isDisabled}
            fillStyle="ghost"
            intent="primary"
            onClick={() =>
                history.push(
                    `/app/settings/channels/gorgias_chat/${integrationId}/languages`,
                )
            }
        >
            Customize Translations
        </Button>
    )
}
