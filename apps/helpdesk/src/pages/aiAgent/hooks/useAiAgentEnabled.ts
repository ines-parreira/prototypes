import { useCallback, useMemo } from 'react'

import { useParams } from 'react-router-dom'

import { RuleType } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { updateRule } from 'models/rule/resources'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useRules } from 'state/entities/rules/hooks'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useAiAgentEnabled = ({
    monitoredEmailIntegrations,
    monitoredChatIntegrations,
    isEnablingChatChannel,
    isEnablingEmailChannel,
}: {
    monitoredEmailIntegrations: { id: number; email: string }[]
    monitoredChatIntegrations: number[]
    isEnablingChatChannel: boolean
    isEnablingEmailChannel: boolean
}) => {
    const { shopType, shopName } = useParams<{
        shopType: string
        shopName: string
    }>()

    const dispatch = useAppDispatch()

    // Get chat channels for the shop
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const chatApplicationsIds = useMemo(
        () =>
            chatChannels
                .filter((v) => monitoredChatIntegrations.includes(v.value.id))
                .map((v) => v.value.meta.app_id)
                .filter((value): value is string => Boolean(value)),

        [chatChannels, monitoredChatIntegrations],
    )

    const {
        applicationsAutomationSettings,
        handleChatApplicationAutomationSettingsUpdate,
    } = useApplicationsAutomationSettings(chatApplicationsIds)

    //Get managed rules
    const [rules, isLoadingRules] = useRules()

    const managedRules = useMemo(() => {
        if (isLoadingRules || !rules) {
            return []
        }
        return Object.values(rules).filter(
            (rule) => rule.type === RuleType.Managed,
        )
    }, [rules, isLoadingRules])

    const successNotification = useMemo(() => {
        const isDisablingAutoresponders =
            isEnablingEmailChannel && monitoredEmailIntegrations.length > 0
        const isDisablingArticleRecommendations =
            isEnablingChatChannel && monitoredChatIntegrations.length > 0

        if (!isDisablingAutoresponders && !isDisablingArticleRecommendations) {
            return ''
        }

        if (isDisablingAutoresponders && isDisablingArticleRecommendations) {
            return 'AI Agent enabled. Autoresponders and Article Recommendations have been turned off to avoid conflicting responses.'
        }

        if (isDisablingAutoresponders) {
            return 'AI Agent enabled. Autoresponders have been turned off to avoid conflicting responses.'
        }

        if (isDisablingArticleRecommendations) {
            return 'AI Agent enabled. Article Recommendations have been turned off to avoid conflicting responses.'
        }
    }, [
        isEnablingEmailChannel,
        monitoredEmailIntegrations.length,
        isEnablingChatChannel,
        monitoredChatIntegrations.length,
    ])

    const updateSettingsAfterAiAgentEnabled = useCallback(() => {
        if (
            monitoredChatIntegrations.length === 0 &&
            monitoredEmailIntegrations.length === 0
        ) {
            return
        }

        const calls = []

        //turn off article recommendations for all monitored chat integrations
        if (isEnablingChatChannel) {
            for (const chatApplicationId of chatApplicationsIds) {
                const updateChatApplicationAutomationSettings =
                    handleChatApplicationAutomationSettingsUpdate(
                        {
                            ...applicationsAutomationSettings[
                                chatApplicationId
                            ],
                            articleRecommendation: { enabled: false },
                        },
                        undefined,
                        true,
                    )
                calls.push(updateChatApplicationAutomationSettings)
            }
        }

        //turn off autoresponder for all managed rules
        if (isEnablingEmailChannel && monitoredEmailIntegrations.length > 0) {
            for (const rule of managedRules) {
                calls.push(
                    updateRule({
                        id: rule.id,
                        deactivated_datetime: new Date().toISOString(),
                    }),
                )
            }
        }

        Promise.all(calls)
            .then(() => {
                if (successNotification !== '') {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: successNotification,
                        }),
                    )
                }
            })
            .catch(() => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'There were some issues applying the settings after AI Agent was enabled. ',
                    }),
                )
            })
    }, [
        applicationsAutomationSettings,
        chatApplicationsIds,
        dispatch,
        handleChatApplicationAutomationSettingsUpdate,
        isEnablingChatChannel,
        isEnablingEmailChannel,
        managedRules,
        monitoredChatIntegrations.length,
        monitoredEmailIntegrations.length,
        successNotification,
    ])

    return {
        updateSettingsAfterAiAgentEnabled,
    }
}
