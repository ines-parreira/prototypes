import {useCallback, useMemo} from 'react'
import {RuleType} from '@gorgias/api-queries'
import {useDispatch} from 'react-redux'
import {useParams} from 'react-router-dom'
import {useRules} from 'state/entities/rules/hooks'
import {updateRule} from 'models/rule/resources'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'

export const useAiAgentEnabled = (
    monitoredEmailIntegrations: {id: number; email: string}[],
    monitoredChatIntegrations: number[]
) => {
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    const dispatch = useDispatch()

    // Get chat channels for the shop
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const chatApplicationsIds = useMemo(
        () =>
            chatChannels
                .filter((v) => monitoredChatIntegrations.includes(v.value.id))
                .map((v) => v.value.meta.app_id)
                .filter((value): value is string => Boolean(value)),

        [chatChannels, monitoredChatIntegrations]
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
            (rule) => rule.type === RuleType.Managed
        )
    }, [rules, isLoadingRules])

    const successNotification = useMemo(() => {
        if (
            monitoredEmailIntegrations.length === 0 &&
            monitoredChatIntegrations.length === 0
        ) {
            return ''
        }

        if (
            monitoredEmailIntegrations.length > 0 &&
            monitoredChatIntegrations.length > 0
        ) {
            return 'AI Agent enabled. Autoresponders and Article Recommendations have been turned off to avoid conflicting responses.'
        }

        if (
            monitoredEmailIntegrations.length > 0 &&
            monitoredChatIntegrations.length === 0
        ) {
            return 'AI Agent enabled. Autoresponders have been turned off to avoid conflicting responses.'
        }

        if (
            monitoredEmailIntegrations.length === 0 &&
            monitoredChatIntegrations.length > 0
        ) {
            return 'AI Agent enabled. Article Recommendations have been turned off to avoid conflicting responses.'
        }
    }, [monitoredEmailIntegrations.length, monitoredChatIntegrations.length])

    const updateSettingsAfterAiAgentEnabled = useCallback(() => {
        if (
            monitoredChatIntegrations.length === 0 &&
            monitoredEmailIntegrations.length === 0
        ) {
            return
        }

        const calls = []

        //turn off article recommendations for all monitored chat integrations
        for (const chatApplicationId of chatApplicationsIds) {
            const updateChatApplicationAutomationSettings =
                handleChatApplicationAutomationSettingsUpdate(
                    {
                        ...applicationsAutomationSettings[chatApplicationId],
                        articleRecommendation: {enabled: false},
                    },
                    undefined,
                    true
                )
            calls.push(updateChatApplicationAutomationSettings)
        }

        //turn off autoresponder for all managed rules
        if (monitoredEmailIntegrations.length > 0) {
            for (const rule of managedRules) {
                calls.push(
                    updateRule({
                        id: rule.id,
                        deactivated_datetime: new Date().toISOString(),
                    })
                )
            }
        }

        Promise.all(calls)
            .then(() => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: successNotification,
                    })
                )
            })
            .catch(() => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'There were some issues applying the settings after AI Agent was enabled. ',
                    })
                )
            })
    }, [
        applicationsAutomationSettings,
        chatApplicationsIds,
        dispatch,
        handleChatApplicationAutomationSettingsUpdate,
        managedRules,
        monitoredChatIntegrations.length,
        monitoredEmailIntegrations.length,
        successNotification,
    ])

    return {
        updateSettingsAfterAiAgentEnabled,
    }
}
