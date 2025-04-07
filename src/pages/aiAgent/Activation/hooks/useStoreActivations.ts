import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { useLocation, useParams } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { StoreActivation } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCard'
import {
    State,
    useStoreActivationReducer,
} from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { useStoresConfigurationMutation } from 'pages/aiAgent/hooks/useStoresConfigurationMutation'
import { useSelfServiceChatChannelsMultiStore } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'
import safeDivide from 'pages/stats/automate/aiSalesAgent/util/safeDivide'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { FocusActivationModal } from '../utils'

export const computeActivationPercentage = (state: State): number => {
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

const useStoreConfigurations = (
    accountDomain: string,
    singleStoreName?: string,
) => {
    const stores = useAppSelector(getShopifyIntegrationsSortedByName)

    const filteredStoresName = useMemo(() => {
        const storeNames = stores.map((store) => store.name)
        if (singleStoreName) {
            return storeNames.filter((store) => store === singleStoreName)
        }

        return storeNames
    }, [stores, singleStoreName])

    const { storeConfigurations: allStoreConfigurations } =
        useStoreConfigurationForAccount({
            accountDomain,
            storesName: filteredStoresName,
        })

    const storeConfigurations: StoreConfiguration[] = useMemo(() => {
        if (singleStoreName) {
            return (
                allStoreConfigurations?.filter(
                    (storeConfiguration) =>
                        storeConfiguration.storeName === singleStoreName,
                ) ?? []
            )
        }

        return allStoreConfigurations ?? []
    }, [allStoreConfigurations, singleStoreName])

    const storeNames = useMemo(() => {
        return storeConfigurations.map((it) => it.storeName)
    }, [storeConfigurations])

    return { storeConfigurations, storeNames }
}

export const useStoreActivations = ({
    // TODO: Remove pageName to use window.location.pathname instead
    pageName,
}: {
    pageName: string
}): {
    storeActivations: Record<string, StoreActivation>
    progressPercentage: number
    changeSales: (storeName: string, newValue: boolean) => void
    changeSupport: (storeName: string, newValue: boolean) => void
    changeSupportChat: (storeName: string, newValue: boolean) => void
    changeSupportEmail: (storeName: string, newValue: boolean) => void
    saveStoreConfigurations: () => Promise<void>
    isLoading: boolean
} => {
    const flags = useFlags()
    const flagsRef = useRef(flags)
    flagsRef.current = flags

    const location = useLocation()
    const params = useParams<{ shopName?: string }>()
    const singleStoreName =
        FocusActivationModal.extractStoreName(location) ?? params.shopName

    const { state, dispatch } = useStoreActivationReducer()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { storeConfigurations, storeNames } = useStoreConfigurations(
        accountDomain,
        singleStoreName,
    )

    const selfServiceChatChannels = useSelfServiceChatChannelsMultiStore(
        SHOPIFY_INTEGRATION_TYPE,
        storeNames,
        false,
    )
    useEffect(() => {
        dispatch({
            type: 'UPDATE_STORE_CONFIGURATION',
            storeConfigurations,
            selfServiceChatChannels,
        })
    }, [selfServiceChatChannels, storeConfigurations, dispatch])

    useGetHelpCenterList(
        { type: 'faq', per_page: HELP_CENTER_MAX_CREATION },
        {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            onSuccess: (helpCenters) => {
                dispatch({
                    type: 'UPDATE_HELP_CENTER_FAQ',
                    helpCenters: helpCenters?.data.data,
                    flags: flagsRef.current,
                })
            },
        },
    )

    const { isLoading, upsertStoresConfiguration } =
        useStoresConfigurationMutation({ accountDomain })

    const saveStoreConfigurations = useCallback(async () => {
        logEvent(SegmentEvent.AiAgentActivateCloseActivationModal, {
            page: pageName,
            reason: 'clicked-on-save-button',
        })

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
    }, [state, upsertStoresConfiguration, pageName])

    return {
        storeActivations: state,
        progressPercentage: computeActivationPercentage(state),
        isLoading,
        changeSales: (storeName: string, newValue: boolean) => {
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
        changeSupport: (storeName: string, newValue: boolean) => {
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
        changeSupportChat: (storeName: string, newValue: boolean) => {
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
        changeSupportEmail: (storeName: string, newValue: boolean) => {
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
        saveStoreConfigurations,
    }
}
