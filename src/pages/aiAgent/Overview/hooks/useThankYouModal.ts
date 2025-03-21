import { useEffect, useState } from 'react'

import { useLocation } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import { useIsGoLiveDisabled } from 'pages/aiAgent/Overview/hooks/useIsGoLiveDisabled'
import { useUpdateAIAgentStoreConfigurationData } from 'pages/aiAgent/Overview/hooks/useUpdateAiAgentStoreConfigurationData'
import { getCurrentDomain } from 'state/currentAccount/selectors'

export const useThankYouModal = () => {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()

    // Extract query parameters
    const queryParams = new URLSearchParams(location.search)
    const shopName = queryParams.get('shopName')
    const isThankYouModalOpen = queryParams.get('from') === 'onboarding'

    useEffect(() => {
        setIsOpen(isThankYouModalOpen)
        if (isThankYouModalOpen) {
            logEvent(SegmentEvent.AiAgentOnboardingThankYouModalViewed)
        }
    }, [isThankYouModalOpen])

    const { isLoading, isDisabled } = useIsGoLiveDisabled(shopName)
    const accountDomain = useAppSelector(getCurrentDomain)

    // Ensure we only call the update hook if shopName is valid
    const storeConfigData = shopName
        ? useUpdateAIAgentStoreConfigurationData(accountDomain, shopName)
        : { storeConfig: null, updateStoreConfig: () => {}, isUpdating: false }

    const { updateStoreConfig } = storeConfigData

    const clearFromQueryParam = () => {
        const newQueryParams = new URLSearchParams(location.search)
        newQueryParams.delete('from')
        newQueryParams.delete('shopName')

        const newUrl =
            newQueryParams.toString().length > 0
                ? `${location.pathname}?${newQueryParams}`
                : location.pathname

        window.history.replaceState({}, '', newUrl)
        setIsOpen(false)
    }

    const handleGoLiveClick = () => {
        updateStoreConfig(clearFromQueryParam)
    }

    const handleModalAction = (action: 'confirm' | 'close') => {
        const cta = isDisabled ? 'continue' : 'go live with ai agent'

        logEvent(SegmentEvent.AiAgentOverviewPageView, { cta })

        if (isDisabled || action === 'close') {
            clearFromQueryParam()
        } else {
            handleGoLiveClick()
        }
    }

    const modalContent = isDisabled
        ? {
              title: "You're almost ready",
              description:
                  'Continue setting up your AI Agent and push it live when ready',
              actionLabel: 'Continue',
              closeLabel: '',
          }
        : {
              title: 'Your account is ready!',
              description: '',
              actionLabel: 'Go live with AI agent',
              closeLabel: 'Close',
          }

    return {
        isOpen,
        isDisabled,
        isLoading,
        handleModalAction,
        modalContent,
    }
}
