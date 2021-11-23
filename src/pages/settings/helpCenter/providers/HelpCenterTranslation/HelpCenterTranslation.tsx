import axios from 'axios'
import produce, {Draft} from 'immer'
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react'
import {useSelector} from 'react-redux'

import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {
    ContactInfoDto,
    HelpCenter,
} from '../../../../../models/helpCenter/types'
import {getViewLanguage} from '../../../../../state/helpCenter/ui'
import {notify} from '../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {HELP_CENTER_DEFAULT_LOCALE} from '../../constants'
import {useCurrentHelpCenter} from '../../hooks/useCurrentHelpCenter'
import {useHelpCenterApi} from '../../hooks/useHelpCenterApi'

export type HelpCenterTranslationState = {
    chatApplicationId: number | null
    contactInfo: ContactInfoDto
}

type Props = {
    children: React.ReactNode
    helpCenter: HelpCenter
}

type HelpCenterTranslationContext = {
    translation: HelpCenterTranslationState
    updateTranslation: (payload: Partial<HelpCenterTranslationState>) => void
    saveTranslation: () => Promise<void>
    resetTranslation: () => void
}

const defaultTranslation: HelpCenterTranslationState = {
    chatApplicationId: null,
    contactInfo: {
        email: {
            description: '',
            enabled: false,
            email: '',
        },
        phone: {
            description: '',
            enabled: false,
            phone_numbers: [],
        },
        chat: {
            description: '',
            enabled: false,
        },
    },
}

const TranslationContext = createContext<HelpCenterTranslationContext>({
    translation: defaultTranslation,
    updateTranslation: () => null,
    saveTranslation: () => Promise.resolve(),
    resetTranslation: () => null,
})

export const HelpCenterTranslation: React.FC<Props> = ({
    children,
    helpCenter,
}: Props) => {
    const dispatch = useAppDispatch()
    const {client} = useHelpCenterApi()
    const {fetchHelpCenterTranslations} = useCurrentHelpCenter()
    const viewLanguage =
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const [translation, updateTranslation] =
        useState<HelpCenterTranslationState>(defaultTranslation)

    const saveTranslation = async () => {
        if (!client) return

        try {
            const {chatApplicationId, contactInfo} = translation

            await client.updateHelpCenterTranslation(
                {
                    help_center_id: helpCenter.id,
                    locale: viewLanguage,
                },
                {
                    chat_application_id: chatApplicationId,
                    contact_info: contactInfo,
                }
            )

            await fetchHelpCenterTranslations()

            void dispatch(
                notify({
                    message: 'Help Center successfully updated',
                    status: NotificationStatus.Success,
                })
            )
        } catch (err) {
            const errorMessage =
                axios.isAxiosError(err) && err.response?.status === 400
                    ? ': some fields are empty or invalid.'
                    : ', please try again later.'

            void dispatch(
                notify({
                    message: `Couldn't update the Help Center${errorMessage}`,
                    status: NotificationStatus.Error,
                })
            )

            console.error(err)
        }
    }

    const handleOnUpdate = useCallback(
        (payload: Partial<HelpCenterTranslationState>) => {
            updateTranslation({
                ...translation,
                ...payload,
            })
        },
        [updateTranslation, translation]
    )

    const updateTranslationFromData = useCallback(() => {
        const updateFn = (draftSettings: Draft<HelpCenterTranslationState>) => {
            const helpCenterTranslation = helpCenter.translations?.find(
                (t) => t.locale === viewLanguage
            )

            if (helpCenterTranslation) {
                const {chat_application_id, contact_info} =
                    helpCenterTranslation

                draftSettings.chatApplicationId = chat_application_id
                draftSettings.contactInfo = {
                    email: {
                        description: contact_info.email.description,
                        enabled:
                            contact_info.email.deactivated_datetime === null,
                        email: contact_info.email.email,
                    },
                    phone: {
                        description: contact_info.phone.description,
                        enabled:
                            contact_info.phone.deactivated_datetime === null,
                        phone_numbers: contact_info.phone.phone_numbers,
                    },
                    chat: {
                        description: contact_info.chat.description,
                        enabled:
                            contact_info.chat.deactivated_datetime === null,
                    },
                }
            }
        }

        updateTranslation(produce(translation, updateFn))
    }, [helpCenter, translation, viewLanguage])

    useEffect(() => {
        updateTranslationFromData()
    }, [helpCenter.translations, viewLanguage])

    useEffect(() => {
        if (!helpCenter.translations) {
            void fetchHelpCenterTranslations()
        }
    }, [])

    return (
        <TranslationContext.Provider
            value={{
                translation,
                updateTranslation: handleOnUpdate,
                saveTranslation,
                resetTranslation: updateTranslationFromData,
            }}
        >
            {children}
        </TranslationContext.Provider>
    )
}

export const useHelpCenterTranslation = (): HelpCenterTranslationContext => {
    return useContext(TranslationContext)
}
