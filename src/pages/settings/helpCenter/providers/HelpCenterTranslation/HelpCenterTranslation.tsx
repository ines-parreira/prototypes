import axios from 'axios'
import produce, {Draft} from 'immer'
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    UpdateContactForm,
    ContactInfoDto,
    HelpCenter,
} from 'models/helpCenter/types'
import {getViewLanguage} from 'state/ui/helpCenter'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {HELP_CENTER_DEFAULT_LOCALE} from 'pages/settings/helpCenter/constants'
import {useHelpCenterActions} from 'pages/settings/helpCenter/hooks/useHelpCenterActions'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

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
    contactForm: UpdateContactForm
    updateTranslation: (payload: Partial<HelpCenterTranslationState>) => void
    updateContactForm: (payload: UpdateContactForm) => void
    updateHelpCenter: () => Promise<void>
    resetTranslation: () => void
    isDirty: boolean
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

const defaultEmailIntegration: UpdateContactForm = {
    helpdesk_integration_email: null,
    helpdesk_integration_id: null,
    card_enabled: true,
}

const TranslationContext = createContext<HelpCenterTranslationContext | null>(
    null
)

export const HelpCenterTranslationProvider: React.FC<Props> = ({
    children,
    helpCenter,
}: Props) => {
    const dispatch = useAppDispatch()
    const {client} = useHelpCenterApi()
    const {fetchHelpCenterTranslations} = useHelpCenterActions()
    const viewLanguage =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const [translation, updateTranslation] =
        useState<HelpCenterTranslationState>(defaultTranslation)
    const [contactForm, updateContactForm] = useState<UpdateContactForm>(
        defaultEmailIntegration
    )
    const [isDirty, setIsDirty] = useState(false)

    const updateHelpCenter = useCallback(async () => {
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

            await client.updateHelpCenter(
                {help_center_id: helpCenter.id},
                {
                    contact_form: contactForm,
                }
            )

            await fetchHelpCenterTranslations()

            void dispatch(
                notify({
                    message: 'Help Center updated with success',
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
                    message: `Could not update the Help Center: ${errorMessage}`,
                    status: NotificationStatus.Error,
                })
            )

            console.error(err)
        }
    }, [
        client,
        dispatch,
        contactForm,
        fetchHelpCenterTranslations,
        helpCenter,
        viewLanguage,
        translation,
    ])

    const handleOnUpdate = useCallback(
        (payload: Partial<HelpCenterTranslationState>) => {
            updateTranslation({
                ...translation,
                ...payload,
            })
            setIsDirty(true)
        },
        [updateTranslation, translation]
    )

    const handleOnUpdateContactForm = useCallback(
        (payload: UpdateContactForm) => {
            updateContactForm(payload)
            setIsDirty(true)
        },
        [updateContactForm]
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

        const updateContactFormFn = (
            draftSettings: Draft<UpdateContactForm>
        ) => {
            draftSettings.helpdesk_integration_email = helpCenter.contact_form
                ? helpCenter.contact_form.helpdesk_integration_email
                : null

            draftSettings.helpdesk_integration_id = helpCenter.contact_form
                ? helpCenter.contact_form.helpdesk_integration_id
                : null

            draftSettings.card_enabled =
                helpCenter.contact_form?.card_enabled !== false
        }

        updateTranslation(produce(translation, updateFn))
        updateContactForm(produce(contactForm, updateContactFormFn))
        setIsDirty(false)
    }, [
        contactForm,
        helpCenter.contact_form,
        helpCenter.translations,
        translation,
        viewLanguage,
    ])

    useEffect(() => {
        updateTranslationFromData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [helpCenter.translations, viewLanguage])

    useEffect(() => {
        if (!helpCenter.translations) {
            void fetchHelpCenterTranslations()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const value = useMemo(
        () => ({
            translation,
            contactForm,
            updateTranslation: handleOnUpdate,
            updateContactForm: handleOnUpdateContactForm,
            updateHelpCenter,
            resetTranslation: updateTranslationFromData,
            isDirty,
        }),
        [
            translation,
            contactForm,
            handleOnUpdate,
            handleOnUpdateContactForm,
            updateHelpCenter,
            updateTranslationFromData,
            isDirty,
        ]
    )

    return (
        <TranslationContext.Provider value={value}>
            {children}
        </TranslationContext.Provider>
    )
}

export const useHelpCenterTranslation = (): HelpCenterTranslationContext => {
    const translationContext = useContext(TranslationContext)

    if (!translationContext) {
        throw new Error(
            'useHelpCenterTranslation must be used within a HelpCenterTranslationProvider'
        )
    }

    return translationContext
}
