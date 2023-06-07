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
    EmailIntegration,
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
import {reportError} from 'utils/errors'
import {getContactFormById} from 'state/entities/contactForm/contactForms'
import {useContactFormApi} from 'pages/settings/contactForm/hooks/useContactFormApi'
import {catchAsync} from 'pages/settings/contactForm/utils/errorHandling'
import {Paths} from 'rest_api/help_center_api/client.generated'
import {getGenericMessageFromError} from '../../utils'

export type HelpCenterTranslationState = {
    contactFormId: number | null
    chatAppKey: string | null
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
    updateContactForm: React.Dispatch<React.SetStateAction<UpdateContactForm>>
    updateHelpCenter: () => Promise<void>
    resetTranslation: () => void
    translationsLoaded: boolean
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
    const [emailIntegration, updateEmailIntegration] =
        useState<EmailIntegration>({id: null, email: null})
    const [isDirty, setIsDirty] = useState(false)
    const [translationsLoaded, setTranslationsLoaded] = useState(false)
    const contactFormFromCache = useAppSelector(
        getContactFormById(translation.contactFormId)
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
            const subjectLineObjects = Object.values(contactForm.subject_lines)

            if (
                subjectLineObjects.some((subjectLineObject) =>
                    subjectLineObject.options.some(
                        (option) => option.trim() === ''
                    )
                )
            ) {
                void dispatch(
                    notify({
                        message: `Could not update the Help Center: some subject lines are empty.`,
                        status: NotificationStatus.Error,
                    })
                )
                return
            }
        }

        try {
            const {chatAppKey, contactInfo} = translation
            await client.updateHelpCenterTranslation(
                {
                    help_center_id: helpCenter.id,
                    locale: viewLanguage,
                },
                {
                    chat_app_key: chatAppKey,
                    contact_info: contactInfo,
                }
            )

            if (translation.contactFormId) {
                if (emailIntegration.email && emailIntegration.id) {
                    await client.updateHelpCenter(
                        {help_center_id: helpCenter.id},
                        {
                            email_integration: {
                                id: emailIntegration.id,
                                email: emailIntegration.email,
                            },
                        }
                    )
                }

                const updates: Paths.UpdateContactForm.RequestBody = {}
                if (
                    contactForm.subject_lines &&
                    contactForm.subject_lines[viewLanguage]
                ) {
                    updates.subject_lines = {
                        options:
                            contactForm.subject_lines[viewLanguage].options,
                        allow_other:
                            contactForm.subject_lines[viewLanguage].allow_other,
                    }
                }

                if (contactForm.card_enabled !== undefined) {
                    updates.deactivated_datetime = contactForm.card_enabled
                        ? null
                        : new Date().toISOString()
                }

                await updateContactFormViaApi(
                    translation.contactFormId,
                    updates
                )
            } else {
                await client.updateHelpCenter(
                    {help_center_id: helpCenter.id},
                    {
                        contact_form: contactForm,
                    }
                )
                await fetchHelpCenterTranslations()
            }

            setIsDirty(false)

            void dispatch(
                notify({
                    message: 'Help Center updated with success',
                    status: NotificationStatus.Success,
                })
            )
        } catch (err) {
            const errorMessage = getGenericMessageFromError(err)

            void dispatch(
                notify({
                    message: `Could not update the Help Center: ${errorMessage}`,
                    status: NotificationStatus.Error,
                })
            )

            reportError(err as Error)
        }
    }, [
        emailIntegration,
        isReady,
        client,
        dispatch,
        contactForm,
        fetchHelpCenterTranslations,
        helpCenter,
        viewLanguage,
        translation,
        updateContactFormViaApi,
    ])

    const handleOnUpdate = useCallback(
        (payload: Partial<HelpCenterTranslationState>) => {
            updateTranslation({
                ...translation,
                ...payload,
            })
        },
        [updateTranslation, translation]
    )

    const handleOnUpdateContactForm = useCallback(
        (payload: React.SetStateAction<UpdateContactForm>) => {
            updateContactForm(payload)
        },
        [updateContactForm]
    )

    const handleOnUpdateEmailIntegration = useCallback(
        (payload: EmailIntegration) => {
            updateEmailIntegration(payload)
            // FIXME: #2566 After migration the support for legacy contact form should be removed
            updateContactForm((previousContactForm) => ({
                ...previousContactForm,
                helpdesk_integration_email: payload?.email,
                helpdesk_integration_id: payload.id,
            }))
        },
        [updateContactForm, updateEmailIntegration]
    )

    const updateTranslationFromData = useCallback(() => {
        const updateFn = (draftSettings: Draft<HelpCenterTranslationState>) => {
            const helpCenterTranslation = helpCenter.translations?.find(
                (t) => t.locale === viewLanguage
            )

            if (helpCenterTranslation) {
                const {chat_app_key, contact_info} = helpCenterTranslation

                draftSettings.contactFormId =
                    helpCenterTranslation.contact_form_id || null
                draftSettings.chatAppKey = chat_app_key
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
            const helpCenterTranslation = helpCenter.translations?.find(
                (t) => t.locale === viewLanguage
            )

            if (
                !helpCenterTranslation ||
                (helpCenterTranslation.contact_form_id && !contactFormFromCache)
            ) {
                return
            }

            draftSettings.helpdesk_integration_email = helpCenter.contact_form
                ? helpCenter.contact_form.helpdesk_integration_email
                : null

            draftSettings.helpdesk_integration_id = helpCenter.contact_form
                ? helpCenter.contact_form.helpdesk_integration_id
                : null

            draftSettings.card_enabled = contactFormFromCache
                ? !contactFormFromCache.deactivated_datetime
                : // FIXME: #2566 After migration the support for legacy contact form should be removed
                  helpCenter.contact_form?.card_enabled !== false

            const subject_lines = helpCenterTranslation.contact_form_id
                ? contactFormFromCache?.subject_lines && {
                      [contactFormFromCache.default_locale]:
                          contactFormFromCache.subject_lines,
                  }
                : // FIXME: #2566 After migration the support for legacy contact form should be removed
                  helpCenter.contact_form?.subject_lines || null

            if (subject_lines) {
                draftSettings.subject_lines = subject_lines
            }
        }

        const updateEmailIntegrationFn = (
            draftSettings: Draft<EmailIntegration>
        ) => {
            if (helpCenter.email_integration) {
                draftSettings.email = helpCenter.email_integration.email
                draftSettings.id = helpCenter.email_integration.id
            } else {
                // FIXME: #2566 After migration the support for legacy contact form should be removed
                draftSettings.email =
                    helpCenter.contact_form?.helpdesk_integration_email || null
                draftSettings.id =
                    helpCenter.contact_form?.helpdesk_integration_id || null
            }
        }

        updateEmailIntegration((prevEmailIntegration) =>
            produce(prevEmailIntegration, updateEmailIntegrationFn)
        )

        updateTranslation((prevTranslation) =>
            produce(prevTranslation, updateFn)
        )
        updateContactForm((prevContactForm) =>
            produce(prevContactForm, updateContactFormFn)
        )
        setIsDirty(false)
    }, [
        helpCenter.email_integration,
        helpCenter.translations,
        viewLanguage,
        contactFormFromCache,
        // FIXME: #2566 After migration the support for legacy contact form should be removed
        helpCenter.contact_form,
    ])

    useEffect(() => {
        updateTranslationFromData()
        if (helpCenter.translations) {
            setTranslationsLoaded(true)
        }
    }, [helpCenter.translations, updateTranslationFromData])

    useEffect(() => {
        const availableLanguages = helpCenter.translations?.map((t) => t.locale)
        if (availableLanguages?.includes(viewLanguage)) {
            void fetchHelpCenterTranslations()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewLanguage])

    useEffect(() => {
        if (!isReady) return

        async function fetchContactForm() {
            const contactFormId = translation.contactFormId
            if (!contactFormId) return

            const [error, result] = await catchAsync(() =>
                fetchContactFormById(contactFormId)
            )

            if (error) {
                void dispatch(
                    notify({
                        message: 'Something went wrong',
                        status: NotificationStatus.Error,
                    })
                )
            }

            if (!result) {
                void dispatch(
                    notify({
                        message: 'Contact Form not found',
                        status: NotificationStatus.Error,
                    })
                )
            }
        }

        void fetchContactForm()
    }, [translation.contactFormId, fetchContactFormById, isReady, dispatch])

    const value = useMemo(
        () => ({
            emailIntegration,
            translation,
            contactForm,
            updateTranslation: handleOnUpdate,
            updateContactForm: handleOnUpdateContactForm,
            updateEmailIntegration: handleOnUpdateEmailIntegration,
            updateHelpCenter,
            resetTranslation: updateTranslationFromData,
            translationsLoaded,
            isDirty,
            setIsDirty,
        }),
        [
            emailIntegration,
            handleOnUpdateEmailIntegration,
            translation,
            contactForm,
            handleOnUpdate,
            handleOnUpdateContactForm,
            updateHelpCenter,
            updateTranslationFromData,
            translationsLoaded,
            isDirty,
            setIsDirty,
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
