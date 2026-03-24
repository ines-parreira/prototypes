import type React from 'react'
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'

import { reportError } from '@repo/logging'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type {
    ContactForm,
    UpdateSubjectLinesProps,
} from 'models/contactForm/types'
import type {
    ContactInfoDto,
    EmailIntegration,
    HelpCenter,
    HelpCenterTranslation,
} from 'models/helpCenter/types'
import { useContactFormApi } from 'pages/settings/contactForm/hooks/useContactFormApi'
import { catchAsync } from 'pages/settings/contactForm/utils/errorHandling'
import { HELP_CENTER_DEFAULT_LOCALE } from 'pages/settings/helpCenter/constants'
import { useHelpCenterActions } from 'pages/settings/helpCenter/hooks/useHelpCenterActions'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import type { Paths } from 'rest_api/help_center_api/client.generated'
import { getContactFormById } from 'state/entities/contactForm/contactForms'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getViewLanguage } from 'state/ui/helpCenter'

import { getGenericMessageFromError } from '../../utils'

export type HelpCenterTranslationState = {
    contactFormId: number | null
    chatAppKey: string | null
    contactInfo: ContactInfoDto
}

type Props = {
    children: React.ReactNode
    helpCenter: HelpCenter
}

type ContactFormState = {
    subject_lines?: UpdateSubjectLinesProps | null
    card_enabled?: boolean
}

type HelpCenterTranslationContext = {
    translation: HelpCenterTranslationState
    contactForm: ContactFormState
    updateTranslation: (payload: Partial<HelpCenterTranslationState>) => void
    updateContactForm: React.Dispatch<React.SetStateAction<ContactFormState>>
    updateHelpCenter: () => Promise<void>
    reset: () => void
    isDirty: boolean
    setIsDirty: React.Dispatch<React.SetStateAction<boolean>>
    emailIntegration: EmailIntegration
    updateEmailIntegration: (payload: EmailIntegration) => void
}

const defaultTranslation: HelpCenterTranslationState = {
    contactFormId: null,
    chatAppKey: null,
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

const TranslationContext = createContext<HelpCenterTranslationContext | null>(
    null,
)

export const HelpCenterTranslationProvider: React.FC<Props> = ({
    children,
    helpCenter,
}: Props) => {
    const dispatch = useAppDispatch()
    const { client } = useHelpCenterApi()
    const { fetchHelpCenterTranslations } = useHelpCenterActions()
    const viewLanguage =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const [translation, setTranslation] =
        useState<HelpCenterTranslationState>(defaultTranslation)
    const [contactForm, setContactForm] = useState<ContactFormState>({
        card_enabled: false,
        subject_lines: null,
    })
    const [emailIntegration, setEmailIntegration] = useState<EmailIntegration>({
        id: null,
        email: null,
    })
    const [isDirty, setIsDirty] = useState(false)
    const contactFormFromCache = useAppSelector(
        getContactFormById(translation.contactFormId),
    )

    const {
        isReady,
        fetchContactFormById,
        updateContactForm: updateContactFormViaApi,
    } = useContactFormApi()

    const updateHelpCenter = useCallback(async () => {
        if (!client || !isReady) return

        // Check if the subject lines are not empty
        if (contactForm.subject_lines) {
            if (
                contactForm.subject_lines.options.some(
                    (option) => option.trim() === '',
                )
            ) {
                void dispatch(
                    notify({
                        message: `Could not update the Help Center: some subject lines are empty.`,
                        status: NotificationStatus.Error,
                    }),
                )
                return
            }
        }

        try {
            if (emailIntegration.email && emailIntegration.id) {
                await client.updateHelpCenter(
                    { help_center_id: helpCenter.id },
                    {
                        email_integration: {
                            id: emailIntegration.id,
                            email: emailIntegration.email,
                        },
                    },
                )
            }

            const { chatAppKey, contactInfo } = translation
            await client.updateHelpCenterTranslation(
                {
                    help_center_id: helpCenter.id,
                    locale: viewLanguage,
                },
                {
                    chat_app_key: chatAppKey,
                    contact_info: contactInfo,
                },
            )

            if (translation.contactFormId) {
                const updates: Paths.UpdateContactForm.RequestBody = {}
                if (contactForm.subject_lines) {
                    updates.subject_lines = {
                        options: contactForm.subject_lines.options,
                        allow_other: contactForm.subject_lines.allow_other,
                    }
                }

                if (contactForm.card_enabled !== undefined) {
                    updates.deactivated_datetime = contactForm.card_enabled
                        ? null
                        : new Date().toISOString()
                }

                await updateContactFormViaApi(
                    translation.contactFormId,
                    updates,
                )
            }

            setIsDirty(false)

            void dispatch(
                notify({
                    message: 'Help Center updated with success',
                    status: NotificationStatus.Success,
                }),
            )
        } catch (err) {
            const errorMessage = getGenericMessageFromError(err)

            void dispatch(
                notify({
                    message: `Could not update the Help Center: ${errorMessage}`,
                    status: NotificationStatus.Error,
                }),
            )

            reportError(err as Error)
        }
    }, [
        emailIntegration,
        isReady,
        client,
        dispatch,
        contactForm,
        helpCenter,
        viewLanguage,
        translation,
        updateContactFormViaApi,
    ])

    const handleOnTranslationUpdate = useCallback(
        (payload: Partial<HelpCenterTranslationState>) => {
            setTranslation({
                ...translation,
                ...payload,
            })
            setIsDirty(true)
        },
        [setTranslation, translation],
    )

    const handleOnUpdateContactForm = useCallback(
        (payload: React.SetStateAction<ContactFormState>) => {
            setContactForm((draft) => ({
                ...draft,
                ...payload,
            }))
            setIsDirty(true)
        },
        [],
    )

    const handleOnEmailIntegrationUpdate = useCallback(
        (payload: EmailIntegration) => {
            setEmailIntegration(payload)
            setIsDirty(true)
        },
        [],
    )

    const resetTranslation = useCallback(
        (translation: HelpCenterTranslation) => {
            setTranslation((draftSettings) => {
                const { contact_info, chat_app_key, contact_form_id } =
                    translation

                return {
                    ...draftSettings,
                    contactFormId: contact_form_id || null,
                    chatAppKey: chat_app_key,
                    contactInfo: {
                        email: {
                            description: contact_info.email.description,
                            enabled:
                                contact_info.email.deactivated_datetime ===
                                null,
                            email: contact_info.email.email,
                        },
                        phone: {
                            description: contact_info.phone.description,
                            enabled:
                                contact_info.phone.deactivated_datetime ===
                                null,
                            phone_numbers: contact_info.phone.phone_numbers,
                        },
                        chat: {
                            description: contact_info.chat.description,
                            enabled:
                                contact_info.chat.deactivated_datetime === null,
                        },
                    },
                }
            })
        },
        [],
    )

    const resetEmailIntegration = useCallback(
        (emailIntegration?: EmailIntegration) => {
            setEmailIntegration({
                email: emailIntegration?.email || null,
                id: emailIntegration?.id || null,
            })
        },
        [],
    )

    const resetContactForm = useCallback((contactForm: ContactForm) => {
        setContactForm({
            subject_lines: contactForm.subject_lines,
            card_enabled: !contactForm.deactivated_datetime,
        })
    }, [])

    const reset = useCallback(() => {
        resetEmailIntegration(helpCenter?.email_integration || undefined)
        if (contactFormFromCache) resetContactForm(contactFormFromCache)
        const currentTranslation = helpCenter.translations?.find(
            (t) => t.locale === viewLanguage,
        )
        if (currentTranslation) resetTranslation(currentTranslation)
        setIsDirty(false)
    }, [
        helpCenter.email_integration,
        contactFormFromCache,
        helpCenter.translations,
        viewLanguage,
        resetEmailIntegration,
        resetContactForm,
        resetTranslation,
    ])

    useEffect(() => {
        resetEmailIntegration(helpCenter?.email_integration || undefined)
    }, [helpCenter.email_integration, resetEmailIntegration])

    useEffect(() => {
        const currentTranslation = helpCenter.translations?.find(
            (t) => t.locale === viewLanguage,
        )
        if (!currentTranslation) return
        resetTranslation(currentTranslation)
    }, [helpCenter.translations, viewLanguage, resetTranslation])

    useEffect(() => {
        const availableLanguages = helpCenter.translations?.map((t) => t.locale)
        if (availableLanguages?.includes(viewLanguage)) {
            void fetchHelpCenterTranslations()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewLanguage])

    useEffect(() => {
        if (!contactFormFromCache) return
        resetContactForm(contactFormFromCache)
    }, [contactFormFromCache, resetContactForm])

    useEffect(() => {
        if (!isReady) return

        async function fetchContactForm() {
            const contactFormId = translation.contactFormId
            if (!contactFormId) return

            const [error, result] = await catchAsync(() =>
                fetchContactFormById(contactFormId),
            )

            if (error) {
                void dispatch(
                    notify({
                        message: 'Something went wrong',
                        status: NotificationStatus.Error,
                    }),
                )
            }

            if (!result) {
                void dispatch(
                    notify({
                        message: 'Contact Form not found',
                        status: NotificationStatus.Error,
                    }),
                )
            }
        }

        void fetchContactForm()
    }, [translation.contactFormId, fetchContactFormById, isReady, dispatch])

    const value = useMemo(
        () => ({
            contactForm,
            emailIntegration,
            isDirty,
            setIsDirty,
            translation,
            updateContactForm: handleOnUpdateContactForm,
            updateEmailIntegration: handleOnEmailIntegrationUpdate,
            updateHelpCenter,
            updateTranslation: handleOnTranslationUpdate,
            reset,
        }),
        [
            contactForm,
            emailIntegration,
            handleOnEmailIntegrationUpdate,
            handleOnTranslationUpdate,
            handleOnUpdateContactForm,
            isDirty,
            setIsDirty,
            translation,
            updateHelpCenter,
            reset,
        ],
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
            'useHelpCenterTranslation must be used within a HelpCenterTranslationProvider',
        )
    }

    return translationContext
}
