import { useEffect, useMemo, useReducer, useRef } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { logEvent, SegmentEvent } from 'common/segment'
import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { StoreActivation } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCard'
import {
    reducer,
    State,
} from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useStoresConfigurationMutation } from 'pages/aiAgent/hooks/useStoresConfigurationMutation'
import { useSelfServiceChatChannelsMultiStore } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'
import safeDivide from 'pages/stats/aiSalesAgent/util/safeDivide'

const computeActivationScore = (state: State): number => {
    const totalStores = Object.values(state).length
    const totalScore = totalStores * 3

    const currentScore = Object.values(state).reduce(
        (score, storeActivation) => {
            let storeScore = 0
            if (storeActivation.support.chat.enabled) {
                storeScore += 1
            }
            if (storeActivation.support.email.enabled) {
                storeScore += 1
            }

            if (storeActivation.sales.enabled) {
                storeScore += 1
            }

            return score + storeScore
        },
        0,
    )

    return Math.round(safeDivide(currentScore, totalScore) * 100)
}

export const useStoreActivations = ({
    accountDomain,
    storeConfigurations,
    pageName,
}: {
    accountDomain: string
    storeConfigurations: StoreConfiguration[]
    pageName: string
}): {
    storeActivations: Record<string, StoreActivation>
    score: number
    onSalesChange: (storeName: string, newValue: boolean) => void
    onSupportChange: (storeName: string, newValue: boolean) => void
    onSupportChatChange: (storeName: string, newValue: boolean) => void
    onSupportEmailChange: (storeName: string, newValue: boolean) => void
    onSave: () => Promise<void>
    isLoading: boolean
} => {
    const flags = useFlags()
    const flagsRef = useRef(flags)
    flagsRef.current = flags

    const [state, dispatch] = useReducer(reducer, {})

    const storeNames = useMemo(() => {
        return storeConfigurations.map((it) => it.storeName)
    }, [storeConfigurations])

    const selfServiceChatChannels = useSelfServiceChatChannelsMultiStore(
        SHOPIFY_INTEGRATION_TYPE,
        storeNames,
    )

    useEffect(() => {
        dispatch({
            type: 'UPDATE_STORE_CONFIGURATION',
            storeConfigurations,
            selfServiceChatChannels,
        })
    }, [storeConfigurations, selfServiceChatChannels])

    const { data: helpCenterListData, status: getHelpCenterListStatus } =
        useGetHelpCenterList(
            { type: 'faq', per_page: HELP_CENTER_MAX_CREATION },
            {
                staleTime: 1000 * 60 * 5,
                refetchOnWindowFocus: false,
            },
        )

    useEffect(() => {
        if (getHelpCenterListStatus !== 'success') {
            return
        }
        dispatch({
            type: 'UPDATE_HELP_CENTER_FAQ',
            helpCenters: helpCenterListData?.data.data,
            flags: flagsRef.current,
        })
    }, [getHelpCenterListStatus, helpCenterListData])

    const { isLoading, upsertStoresConfiguration } =
        useStoresConfigurationMutation({ accountDomain })

    const onSave = async () => {
        const updatedConfigurations: StoreConfiguration[] = Object.values(
            state,
        ).map((store) => {
            return {
                ...store.configuration,
                scopes: [
                    store.support.enabled ? AiAgentScope.Support : null,
                    store.sales.enabled ? AiAgentScope.Sales : null,
                ].filter(Boolean) as AiAgentScope[],
                chatChannelDeactivatedDatetime: !store.support.chat.enabled
                    ? new Date().toISOString()
                    : null,
                emailChannelDeactivatedDatetime: !store.support.email.enabled
                    ? new Date().toISOString()
                    : null,
            }
        })

        await upsertStoresConfiguration(updatedConfigurations)
    }

    return {
        storeActivations: state,
        score: computeActivationScore(state),
        onSalesChange: (storeName: string, newValue: boolean) => {
            dispatch({ type: 'CHANGE_SALES', storeName, newValue })
            logEvent(
                newValue
                    ? SegmentEvent.AiAgentActivateModalSkillEnabled
                    : SegmentEvent.AiAgentActivateModalSkillDisabled,
                {
                    storeName,
                    skill: AiAgentScope.Sales,
                    page: pageName,
                },
            )
        },
        onSupportChange: (storeName: string, newValue: boolean) => {
            dispatch({
                type: 'CHANGE_SUPPORT',
                storeName,
                newValue,
            })
            logEvent(
                newValue
                    ? SegmentEvent.AiAgentActivateModalSkillEnabled
                    : SegmentEvent.AiAgentActivateModalSkillDisabled,
                {
                    storeName,
                    skill: AiAgentScope.Support,
                    page: pageName,
                },
            )
        },
        onSupportChatChange: (storeName: string, newValue: boolean) => {
            dispatch({
                type: 'CHANGE_SUPPORT_CHAT',
                storeName,
                newValue,
            })
            logEvent(
                newValue
                    ? SegmentEvent.AiAgentActivateModalSkillEnabled
                    : SegmentEvent.AiAgentActivateModalSkillDisabled,
                {
                    storeName,
                    skill: AiAgentScope.Support,
                    page: pageName,
                    channel: 'chat',
                },
            )
        },
        onSupportEmailChange: (storeName: string, newValue: boolean) => {
            dispatch({
                type: 'CHANGE_SUPPORT_EMAIL',
                storeName,
                newValue,
            })
            logEvent(
                newValue
                    ? SegmentEvent.AiAgentActivateModalSkillEnabled
                    : SegmentEvent.AiAgentActivateModalSkillDisabled,
                {
                    storeName,
                    skill: AiAgentScope.Support,
                    page: pageName,
                    channel: 'email',
                },
            )
        },
        onSave,
        isLoading,
    }
}
