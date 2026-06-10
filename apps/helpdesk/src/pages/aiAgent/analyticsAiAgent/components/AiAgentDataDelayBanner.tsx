import { useLocalStorage } from '@gorgias/toolkit-react'

import { Banner } from '@gorgias/axiom'
import {
    DATA_FILTERING_WARNING_MESSAGE,
    DISMISSED_FILTERING_MESSAGE_BANNER,
} from 'pages/aiAgent/analyticsAiAgent/constants'

export const AiAgentDataDelayBanner = () => {
    const [isDismissed, setIsDismissed] = useLocalStorage(
        DISMISSED_FILTERING_MESSAGE_BANNER,
        false,
    )

    if (isDismissed) {
        return undefined
    }

    return (
        <Banner
            size="sm"
            isClosable
            intent="info"
            description={DATA_FILTERING_WARNING_MESSAGE}
            onOpenChange={(nextState) => {
                if (!nextState) {
                    setIsDismissed(true)
                }
            }}
        />
    )
}
