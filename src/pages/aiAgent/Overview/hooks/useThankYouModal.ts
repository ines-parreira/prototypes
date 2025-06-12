import { useEffect, useState } from 'react'

import { useLocation } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'

export const useThankYouModal = () => {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()

    // Extract query parameters
    const queryParams = new URLSearchParams(location.search)
    const shopName = queryParams.get('shopName')
    const isThankYouModalOpen =
        queryParams.get('from') === 'onboarding' && !!shopName

    useEffect(() => {
        setIsOpen(isThankYouModalOpen)
        if (isThankYouModalOpen) {
            logEvent(SegmentEvent.AiAgentOnboardingThankYouModalViewed)
        }
    }, [isThankYouModalOpen])

    const { activation } = useStoreActivations({
        pageName: window.location.pathname,
        withStoresKnowledgeStatus: true,
        withChatIntegrationsStatus: true,
        storeName: shopName ?? undefined,
    })
    const activateShop = activation({ shopName })
    const canActivate = activateShop.canActivate()

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

    const handleGoLiveClick = async () => {
        await activateShop.activate(clearFromQueryParam)
    }

    const handleModalAction = async (action: 'confirm' | 'close') => {
        const cta = canActivate.isDisabled
            ? 'continue'
            : 'go live with ai agent'

        logEvent(SegmentEvent.AiAgentOverviewPageView, { cta })

        if (canActivate.isDisabled || action === 'close') {
            clearFromQueryParam()
        } else {
            await handleGoLiveClick()
        }
    }

    const modalContent = canActivate.isDisabled
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
              actionLoading: activateShop.isActivating,
              closeLabel: 'Close',
          }

    return {
        isOpen,
        isDisabled: canActivate.isDisabled,
        isLoading: canActivate.isLoading,
        handleModalAction,
        modalContent,
    }
}
