import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {getInTicketSuggestionSettings} from 'state/currentAccount/selectors'
import useLocalStorage from 'hooks/useLocalStorage'
import {
    getCurrentHelpdeskProduct,
    getHasAutomate,
} from 'state/billing/selectors'
import {convertLegacyPlanNameToPublicPlanName} from 'utils/paywalls'
import useAppDispatch from 'hooks/useAppDispatch'
import {submitSetting} from 'state/currentAccount/actions'
import {AccountSettingType} from 'state/currentAccount/types'
import {getTopRankMacroState} from 'state/ticket/selectors'

const DEMO_SUGGESTION_DISMISSED_TICKETS = 'demo-suggestion-dismissed-tickets'

/**
 * @description
 * This hook is used to determine if the demo suggestion should be displayed for a ticket. Criteria:
 * - Pro+ account
 * - Frequency threshold based on feature flag
 * - User has not dismissed the demo suggestion
 * - User has not dismissed the demo suggestion more than 3 times
 * - Account has not hidden the demo suggestion
 */
export default function useRuleSuggestionForDemos(
    ticketId: number,
    shouldCheckFrequency: boolean
) {
    const [demoSuggestionDismissedTickets, setDemoSuggestionDismissedTickets] =
        useLocalStorage<number[]>(DEMO_SUGGESTION_DISMISSED_TICKETS)

    const hasAutomate = useAppSelector(getHasAutomate)
    const helpdeskPrice = useAppSelector(getCurrentHelpdeskProduct)
    const currentPlanName = helpdeskPrice
        ? convertLegacyPlanNameToPublicPlanName(helpdeskPrice.name)
        : null

    const inTicketSuggestionForDemo = useAppSelector(
        getInTicketSuggestionSettings
    )
    const ticketDemoSuggestion = useFlags()[FeatureFlagKey.TicketDemoSuggestion]
    const enforceTicketDemoSuggestion =
        useFlags()[FeatureFlagKey.EnforceTicketDemoSuggestion]

    const dispatch = useAppDispatch()

    const isProPlus = ['pro', 'advanced', 'enterprise', 'custom'].some(
        (priceType) => currentPlanName?.toLowerCase().includes(priceType)
    )

    const topRankMacroState = useAppSelector(getTopRankMacroState)

    const frequencyThreshold = useMemo(() => {
        const frequency =
            typeof ticketDemoSuggestion === 'number'
                ? ticketDemoSuggestion / 100
                : 0

        return shouldCheckFrequency
            ? Math.random() < frequency
            : !!ticketDemoSuggestion
    }, [ticketDemoSuggestion, shouldCheckFrequency])

    const shouldDisplayDemoSuggestion = useMemo(() => {
        const userSettingDismissTreshold = !!(
            demoSuggestionDismissedTickets?.length &&
            demoSuggestionDismissedTickets.length > 2
        )
        const userSettingDismissTicket =
            !!demoSuggestionDismissedTickets?.includes(ticketId)
        const accountSettingDismiss =
            !!inTicketSuggestionForDemo?.data?.is_demo_hidden

        const macroPrefillActive =
            topRankMacroState && topRankMacroState.macroId

        return (
            frequencyThreshold &&
            !macroPrefillActive &&
            isProPlus &&
            !userSettingDismissTreshold &&
            !userSettingDismissTicket &&
            !accountSettingDismiss
        )
    }, [
        demoSuggestionDismissedTickets,
        frequencyThreshold,
        inTicketSuggestionForDemo,
        isProPlus,
        ticketId,
        topRankMacroState,
    ])

    const setDemoSuggestionSettingPerUser = () => {
        setDemoSuggestionDismissedTickets((prevState: number[] | undefined) => {
            return [...(prevState || []), ticketId]
        })
    }

    const setDemoSuggestionSettingPerAccount = async () => {
        await dispatch(
            submitSetting({
                id: inTicketSuggestionForDemo?.id,
                type: AccountSettingType.InTicketSuggestion,
                data: {
                    is_demo_hidden: true,
                },
            })
        )
    }

    return {
        shouldDisplayDemoSuggestion:
            hasAutomate ||
            enforceTicketDemoSuggestion ||
            shouldDisplayDemoSuggestion,
        setDemoSuggestionSettingPerUser,
        setDemoSuggestionSettingPerAccount,
    }
}
