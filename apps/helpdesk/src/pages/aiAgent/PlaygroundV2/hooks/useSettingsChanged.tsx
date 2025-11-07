import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useAIJourneyContext } from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { useSettingsContext } from 'pages/aiAgent/PlaygroundV2/contexts/SettingsContext'
import {
    AIJourneySettings,
    InboundSettings,
    PlaygroundChannels,
} from 'pages/aiAgent/PlaygroundV2/types'

type NormalizedInboundState = {
    channel: PlaygroundChannels
    selectedCustomerId: number | null
} & InboundSettings

type NormalizedOutboundState = Omit<AIJourneySettings, 'selectedProduct'> & {
    selectedProductId: number | null
}

type NormalizedOutboundStateForComparison = Omit<
    NormalizedOutboundState,
    'journeyType'
>

type InitialState = {
    inbound: NormalizedInboundState
    outbound: NormalizedOutboundState
}

function shallowEqual<T extends Record<string, unknown>>(
    obj1: T,
    obj2: T,
): boolean {
    const keys1 = Object.keys(obj1) as Array<keyof T>
    const keys2 = Object.keys(obj2) as Array<keyof T>

    if (keys1.length !== keys2.length) {
        return false
    }

    for (const key of keys1) {
        const val1 = obj1[key]
        const val2 = obj2[key]

        if (val1 !== val2) {
            return false
        }
    }

    return true
}

export const useSettingsChanged = () => {
    const { channel, areActionsEnabled } = useCoreContext()
    const { mode, chatAvailability, selectedCustomer } = useSettingsContext()
    const { aiJourneySettings } = useAIJourneyContext()

    const initialStateRef = useRef<InitialState | null>(null)
    const [updated, forceUpdate] = useState(0)

    const currentInboundState = useMemo<NormalizedInboundState>(
        () => ({
            channel,
            chatAvailability,
            selectedCustomer,
            selectedCustomerId: selectedCustomer?.id ?? null,
            areActionsEnabled,
        }),
        [channel, chatAvailability, selectedCustomer, areActionsEnabled],
    )

    const currentOutboundState = useMemo<NormalizedOutboundState>(
        () => ({
            journeyType: aiJourneySettings.journeyType,
            selectedProductId: aiJourneySettings.selectedProduct?.id ?? null,
            totalFollowUp: aiJourneySettings.totalFollowUp,
            includeProductImage: aiJourneySettings.includeProductImage,
            includeDiscountCode: aiJourneySettings.includeDiscountCode,
            discountCodeValue: aiJourneySettings.discountCodeValue,
            discountCodeMessageIdx: aiJourneySettings.discountCodeMessageIdx,
            outboundMessageInstructions:
                aiJourneySettings.outboundMessageInstructions,
        }),
        [aiJourneySettings],
    )

    useEffect(() => {
        if (!initialStateRef.current) {
            initialStateRef.current = {
                inbound: { ...currentInboundState },
                outbound: { ...currentOutboundState },
            }
        }
    }, [currentInboundState, currentOutboundState])

    useEffect(() => {
        if (
            initialStateRef.current &&
            initialStateRef.current.outbound.journeyType !==
                currentOutboundState.journeyType
        ) {
            initialStateRef.current = {
                ...initialStateRef.current,
                outbound: { ...currentOutboundState },
            }
            forceUpdate((n) => n + 1)
        }
    }, [currentOutboundState])

    const hasInboundChanged = useMemo(() => {
        if (!initialStateRef.current) return false

        return !shallowEqual(
            initialStateRef.current.inbound,
            currentInboundState,
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentInboundState, updated])

    const hasOutboundChanged = useMemo(() => {
        if (!initialStateRef.current) return false

        const { journeyType: __initialJourneyType, ...initialOutboundState } =
            initialStateRef.current.outbound
        const {
            journeyType: __currentJourneyType,
            ...currentOutboundStateWithoutJourneyType
        } = currentOutboundState

        return !shallowEqual(
            initialOutboundState as NormalizedOutboundStateForComparison,
            currentOutboundStateWithoutJourneyType as NormalizedOutboundStateForComparison,
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentOutboundState, updated])

    const hasChanged =
        mode === 'inbound' ? hasInboundChanged : hasOutboundChanged

    const resetInitialState = useCallback(() => {
        initialStateRef.current = {
            inbound: { ...currentInboundState },
            outbound: { ...currentOutboundState },
        }
        forceUpdate((n) => n + 1)
    }, [currentInboundState, currentOutboundState])

    return {
        hasChanged,
        hasInboundChanged,
        hasOutboundChanged,
        resetInitialState,
    }
}
