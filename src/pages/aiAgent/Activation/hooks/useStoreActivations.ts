import { useEffect, useReducer, useRef } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { logEvent, SegmentEvent } from 'common/segment'
import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { StoreActivation } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCard'
import { reducer } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useStoresConfigurationMutation } from 'pages/aiAgent/hooks/useStoresConfigurationMutation'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'

import { PageName } from '../types'

export const computeActivationScore = (
    storeConfigs: Pick<
        StoreConfiguration,
        | 'scopes'
        | 'chatChannelDeactivatedDatetime'
        | 'emailChannelDeactivatedDatetime'
    >[],
): { currentScore: number; totalScore: number } => {
    const totalStores = storeConfigs.length
    const totalScore = totalStores * 3

    const currentScore = storeConfigs.reduce((score, config) => {
        let storeScore = 0
        if (config.scopes.includes(AiAgentScope.Support)) {
            if (!config.chatChannelDeactivatedDatetime) {
                storeScore += 1
            }
            if (!config.emailChannelDeactivatedDatetime) {
                storeScore += 1
            }
        }

        if (config.scopes.includes(AiAgentScope.Sales)) {
            storeScore += 1
        }

        return score + storeScore
    }, 0)

    return {
        currentScore,
        totalScore,
    }
}

export const useStoreActivations = ({
    accountDomain,
    storeConfigurations,
    pageName,
}: {
    accountDomain: string
    storeConfigurations: StoreConfiguration[]
    pageName?: PageName
}): {
    storeActivations: Record<string, StoreActivation>
    score: { currentScore: number; totalScore: number }
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

    useEffect(() => {
        dispatch({ type: 'UPDATE_STORE_CONFIGURATION', storeConfigurations })
    }, [storeConfigurations])

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
        score: computeActivationScore(storeConfigurations),
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
