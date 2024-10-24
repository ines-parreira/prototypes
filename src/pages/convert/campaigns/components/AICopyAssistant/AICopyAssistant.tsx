import React from 'react'

import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import {useIsAICopyAssistantEnabled} from 'pages/convert/common/hooks/useIsAICopyAssistantEnabled'

import css from './AICopyAssistant.less'

export const AICopyAssistant = () => {
    const isAssistantEnabled = useIsAICopyAssistantEnabled()
    if (!isAssistantEnabled) {
        return null
    }

    return (
        <AIBanner className={css.banner} hasError={false}>
            Assistant placeholder
        </AIBanner>
    )
}
