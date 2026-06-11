import { useCallback } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useHistory } from 'react-router-dom'

import { Button, Menu, MenuItem } from '@gorgias/axiom'
import { JourneyTypeEnum } from '@gorgias/convert-client'

import {
    JOURNEY_TYPE_MAP_TO_STRING,
    JOURNEY_TYPES_MAP_TO_URL,
    STEPS_NAMES,
} from 'AIJourney/constants'
import { useJourneyContext } from 'AIJourney/providers'

const STANDARD_FLOW_TYPES: JourneyTypeEnum[] = [
    JourneyTypeEnum.SessionAbandoned,
    JourneyTypeEnum.CartAbandoned,
    JourneyTypeEnum.PostPurchase,
    JourneyTypeEnum.Welcome,
    JourneyTypeEnum.WinBack,
]

export const CreateFlowButton = () => {
    const isMultiInstanceEnabled =
        useFlag(FeatureFlagKey.AiJourneyMultiInstanceFlows) &&
        !!window.USER_IMPERSONATED
    const isCustomFlowEnabled = useFlag(
        FeatureFlagKey.AiJourneyCustomFlowEnabled,
    )
    const { shopName } = useJourneyContext()
    const history = useHistory()

    const handleCreate = useCallback(
        (type: JourneyTypeEnum) => {
            history.push(
                `/app/ai-journey/${shopName}/${JOURNEY_TYPES_MAP_TO_URL[type]}/${STEPS_NAMES.SETUP}`,
            )
        },
        [history, shopName],
    )

    if (!isMultiInstanceEnabled) {
        return null
    }

    return (
        <Menu
            trigger={({ isOpen }) => (
                <Button
                    trailingSlot={
                        isOpen ? 'arrow-chevron-up' : 'arrow-chevron-down'
                    }
                >
                    Create flow
                </Button>
            )}
            aria-label="Create flow options"
        >
            {STANDARD_FLOW_TYPES.map((type) => (
                <MenuItem
                    key={type}
                    id={type}
                    label={JOURNEY_TYPE_MAP_TO_STRING[type]}
                    onAction={() => handleCreate(type)}
                />
            ))}
            {isCustomFlowEnabled && (
                <MenuItem
                    id={JourneyTypeEnum.Custom}
                    label={JOURNEY_TYPE_MAP_TO_STRING[JourneyTypeEnum.Custom]}
                    onAction={() => handleCreate(JourneyTypeEnum.Custom)}
                />
            )}
        </Menu>
    )
}
