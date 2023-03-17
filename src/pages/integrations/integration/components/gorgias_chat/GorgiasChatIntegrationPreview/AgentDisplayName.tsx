import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {GorgiasChatAvatarNameType} from 'models/integration/types'

export const AgentDisplayName = ({
    chatTitle,
    className,
    name,
    type,
}: {
    chatTitle?: string
    className?: string
    name: string
    type?: GorgiasChatAvatarNameType
}) => {
    let displayName = name
    const isAgentAvatarCustomizationEnabled =
        useFlags()[FeatureFlagKey.ChatAgentAvatarCustomization]

    if (isAgentAvatarCustomizationEnabled) {
        const displayNameArray = displayName.split(' ')

        switch (type) {
            case GorgiasChatAvatarNameType.AGENT_FIRST_NAME:
                displayName = displayNameArray[0]
                break
            case GorgiasChatAvatarNameType.AGENT_FIRST_LAST_NAME_INITIAL:
                displayName =
                    displayNameArray.length > 1
                        ? `${displayNameArray[0]} ${displayNameArray[1].charAt(
                              0
                          )}.`
                        : displayNameArray[0]
                break
            case GorgiasChatAvatarNameType.AGENT_FULLNAME:
                // no need to update 'displayName'
                break
            case GorgiasChatAvatarNameType.CHAT_TITLE:
                displayName = chatTitle ?? displayName
                break
        }
    }

    return <div className={className}>{displayName}</div>
}
