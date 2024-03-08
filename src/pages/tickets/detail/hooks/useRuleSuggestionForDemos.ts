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
export default function useRuleSuggestionForDemos(ticketId: number) {
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

    const dispatch = useAppDispatch()

    const isProPlus = ['pro', 'advanced', 'enterprise'].some((priceType) =>
        currentPlanName?.toLowerCase().includes(priceType)
    )

    const frequencyThreshold = useMemo(() => {
        const frequency =
            typeof ticketDemoSuggestion === 'number'
                ? ticketDemoSuggestion / 100
                : 0

        return Math.random() < frequency
    }, [ticketDemoSuggestion])

    const shouldDisplayDemoSuggestion = useMemo(() => {
        const userSettingDismissTreshold = !!(
            demoSuggestionDismissedTickets?.length &&
            demoSuggestionDismissedTickets.length > 2
        )
        const userSettingDismissTicket =
            !!demoSuggestionDismissedTickets?.includes(ticketId)
        const accountSettingDismiss =
            !!inTicketSuggestionForDemo?.data?.is_demo_hidden

        return (
            frequencyThreshold &&
            !userSettingDismissTreshold &&
            !userSettingDismissTicket &&
            !accountSettingDismiss &&
            isProPlus
        )
    }, [
        ticketId,
        isProPlus,
        frequencyThreshold,
        inTicketSuggestionForDemo,
        demoSuggestionDismissedTickets,
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
        shouldDisplayDemoSuggestion: hasAutomate || shouldDisplayDemoSuggestion,
        setDemoSuggestionSettingPerUser,
        setDemoSuggestionSettingPerAccount,
    }
}
