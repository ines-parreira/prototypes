import { useHistory } from 'react-router-dom'

import Button from 'pages/common/components/button/Button'

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
