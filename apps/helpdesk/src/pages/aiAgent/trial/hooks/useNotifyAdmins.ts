import { useCallback, useEffect, useMemo, useState } from 'react'

import { useCreateAiShoppingAssistantTrialRequest } from '@gorgias/helpdesk-queries'

import { isLessThan24HoursAgo } from 'automate/notifications/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { getAccountAdminsJS } from 'state/agents/selectors'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useNotifyAdmins = (shopName: string, additionalNote?: string) => {
    const dispatch = useAppDispatch()
    const accountAdmins = useAppSelector(getAccountAdminsJS)
    const currentUser = useAppSelector(getCurrentUser)
    const currentAccountId = useAppSelector(getCurrentAccountId)
    const {
        handleOnTriggerTrialRequestNotification,
        onboardingNotificationState,
        isLoading: isLoadingOnboardingNotificationState,
    } = useAiAgentOnboardingNotification({
        shopName,
    })
    const { mutate: createAiShoppingAssistantTrialRequest } =
        useCreateAiShoppingAssistantTrialRequest()

    const [isOpen, setIsOpen] = useState(false)
    const [isDisabled, setIsDisabled] = useState(false)

    useEffect(() => {
        const existingUser =
            onboardingNotificationState?.trialRequestNotification?.find(
                (request) => request.userId === currentUser.get('id'),
            )

        if (
            existingUser &&
            isLessThan24HoursAgo(existingUser.receivedDatetime)
        ) {
            setIsDisabled(true)
        } else {
            setIsDisabled(false)
        }
    }, [currentUser, onboardingNotificationState])

    const handleNotifyAdmins = useCallback(() => {
        try {
            handleOnTriggerTrialRequestNotification()

            void createAiShoppingAssistantTrialRequest({
                data: {
                    account_id: currentAccountId,
                    current_user_id: currentUser.get('id'),
                    shop_name: shopName,
                    additional_note: additionalNote,
                },
            })

            void dispatch(
                notify({
                    message:
                        'Your request to Shopping Assistant trial has been sent to all Gorgias admins.',
                    status: NotificationStatus.Success,
                }),
            )
            setIsOpen(false)
            setIsDisabled(true)
        } catch (error) {
            console.error(error)
        }
    }, [
        dispatch,
        handleOnTriggerTrialRequestNotification,
        currentAccountId,
        currentUser,
        shopName,
        additionalNote,
        createAiShoppingAssistantTrialRequest,
    ])

    const handleModalOpen = useCallback(() => {
        setIsOpen(true)
    }, [])

    const handleModalClose = useCallback(() => {
        setIsOpen(false)
    }, [])

    const modalContent = useMemo(
        () => ({
            title: 'Request your admin to activate Shopping Assistant trial',
            subtitle:
                'Your Gorgias admins will be notified of your request via both email and an in-app notification.',
            primaryCTALabel: 'Notify Admins',
            accountAdmins,
            onPrimaryAction: handleNotifyAdmins,
            onClose: handleModalClose,
        }),
        [accountAdmins, handleNotifyAdmins, handleModalClose],
    )

    return {
        isLoading: isLoadingOnboardingNotificationState,
        isOpen,
        isDisabled,
        modalContent,
        handleModalOpen,
        handleModalClose,
    }
}
