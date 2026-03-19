import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { get, isEqual } from 'lodash'
import type { Path } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useHistory, useLocation } from 'react-router-dom'

import {
    getLanguagesFromChatConfig,
    getPrimaryLanguageFromChatConfig,
    isTextsMultiLanguage,
    mapIntegrationLanguagesToLanguagePicker,
} from 'config/integrations/gorgias_chat'
import type { LanguageChat } from 'constants/languages'
import useAppDispatch from 'hooks/useAppDispatch'
import type { GorgiasChatIntegration } from 'models/integration/types'
import { GorgiasChatLauncherType } from 'models/integration/types'
import useIsAutomateSubscriber from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsAutomateSubscriber'
import useIntegrationPageViewLogEvent from 'pages/integrations/integration/hooks/useIntegrationPageViewLogEvent'
import type {
    Texts,
    TextsMultiLanguage,
    TextsPerLanguage,
    Translations,
} from 'rest_api/gorgias_chat_protected_api/types'
import * as IntegrationsActions from 'state/integrations/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import {
    emptyTextsPerLanguage,
    getSelectedLanguage,
    multiLanguageInitialTextsEmptyData,
} from '../utils/translateTextHelpers'
import { deleteUnusedKeys } from '../utils/translations-available-keys'
import { useTranslateTextModals } from './useTranslateTextModals'
import { useUpdateApplicationTexts } from './useUpdateApplicationTexts'

enum LoadingState {
    NOT_LOADED = 'not-loaded',
    LOADING = 'loading',
    LOADED = 'loaded',
}

type Props = {
    integration: Map<string, unknown>
}

export const useGorgiasTranslateText = ({ integration }: Props) => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const location = useLocation()
    const { mutateAsync: updateApplicationTexts, isLoading: isSubmitting } =
        useUpdateApplicationTexts()

    useIntegrationPageViewLogEvent(
        SegmentEvent.ChatSettingsToneOfVoicePageViewed,
        {
            isReady: !!integration,
            integration,
        },
    )

    const integrationChat: GorgiasChatIntegration = integration.toJS()

    const isAutomateSubscriber = useIsAutomateSubscriber(integrationChat)

    const segments = location.pathname.split('/')
    const [lastSegment, setLastSegment] = useState<string | undefined>(
        undefined,
    )
    const [language, setLanguage] = useState<Map<string, string> | null>(null)
    const [hasChanges, setHasChanges] = useState(false)
    const [translations, setTranslations] = useState<Translations>({
        texts: {},
        sspTexts: {},
        meta: {},
    })

    const {
        modalState,
        openLanguageChangeModal,
        openExitModal,
        onCloseModals,
        isExitModalOpen,
        isLanguageChangeModalOpen,
    } = useTranslateTextModals()

    useEffectOnce(() => {
        setLastSegment(segments.pop() || (segments.pop() as string))
    })

    const [initialTexts, setInitialTexts] = useState<Texts>(
        multiLanguageInitialTextsEmptyData,
    )

    const initialTextsOfSelectedLanguageRef = useRef<TextsPerLanguage>(
        emptyTextsPerLanguage,
    )

    const form = useForm<TextsPerLanguage>({
        defaultValues: emptyTextsPerLanguage,
    })

    const [textsLoadingState, setTextsLoadingState] = useState<LoadingState>(
        LoadingState.NOT_LOADED,
    )
    const [translationsLoadingState, setTranslationsLoadingState] =
        useState<LoadingState>(LoadingState.NOT_LOADED)

    const languagePickerLanguages = useMemo(
        () => mapIntegrationLanguagesToLanguagePicker(integration),
        [integration],
    )

    const integrationDefaultLanguage = useMemo(() => {
        if (integrationChat.meta) {
            return getPrimaryLanguageFromChatConfig(integrationChat.meta)
        }
        return null
    }, [integrationChat])

    const integrationLanguages = useMemo(() => {
        if (integrationChat.meta) {
            return getLanguagesFromChatConfig(integrationChat.meta)
        }
        return null
    }, [integrationChat])

    const languageBasedOnUrl = useMemo(() => {
        if (
            !integrationDefaultLanguage ||
            !integrationLanguages ||
            !lastSegment
        ) {
            return undefined
        }

        if (integrationLanguages.includes(lastSegment)) {
            return getSelectedLanguage(lastSegment as LanguageChat)
        }
        return getSelectedLanguage(integrationDefaultLanguage as LanguageChat)
    }, [integrationDefaultLanguage, integrationLanguages, lastSegment])

    const dependenciesLoaded = useMemo(() => {
        return (
            translationsLoadingState === LoadingState.LOADED &&
            textsLoadingState === LoadingState.LOADED
        )
    }, [textsLoadingState, translationsLoadingState])

    useEffect(() => {
        if (languageBasedOnUrl) {
            setLanguage(languageBasedOnUrl)
        }
    }, [languageBasedOnUrl])

    useEffect(() => {
        if (
            translationsLoadingState === LoadingState.NOT_LOADED &&
            language &&
            integrationDefaultLanguage
        ) {
            setTranslationsLoadingState(LoadingState.LOADING)

            void IntegrationsActions.getTranslations(
                language.get('value'),
            ).then((data: Translations) => {
                setTranslations({
                    ...data,
                    texts: {
                        ...data.texts,
                        chatTitle: `${integrationChat.name} (chat title)`,
                        chatWithUs: `${data.texts.chatWithUs} (launcher label)`,
                    },
                })
                setTranslationsLoadingState(LoadingState.LOADED)
            })
        }

        const applicationId = integrationChat.meta?.app_id
        if (
            applicationId &&
            textsLoadingState === LoadingState.NOT_LOADED &&
            language &&
            integrationDefaultLanguage &&
            initialTexts &&
            translationsLoadingState === LoadingState.LOADED
        ) {
            setTextsLoadingState(LoadingState.LOADING)

            void IntegrationsActions.getApplicationTexts(applicationId).then(
                (data: Texts) => {
                    if (!isTextsMultiLanguage(data)) {
                        const textsMultiLanguage: TextsMultiLanguage = {
                            ...multiLanguageInitialTextsEmptyData,
                            [integrationDefaultLanguage as LanguageChat]:
                                data as TextsPerLanguage,
                        }
                        setInitialTexts(textsMultiLanguage)
                        const textsOfSelectedLanguageValue =
                            textsMultiLanguage[
                                language.get('value') as LanguageChat
                            ]
                        initialTextsOfSelectedLanguageRef.current =
                            textsOfSelectedLanguageValue
                        form.reset(textsOfSelectedLanguageValue)
                    } else {
                        let textsMultiLanguage: TextsMultiLanguage = {
                            ...multiLanguageInitialTextsEmptyData,
                            ...(data as TextsMultiLanguage),
                        }

                        const languageEnum = language.get(
                            'value',
                        ) as LanguageChat

                        if (
                            integrationChat.meta.preferences
                                ?.privacy_policy_disclaimer_enabled &&
                            !textsMultiLanguage[languageEnum].texts
                                .privacyPolicyDisclaimer
                        ) {
                            textsMultiLanguage = {
                                ...textsMultiLanguage,
                                [languageEnum]: {
                                    ...textsMultiLanguage[languageEnum],
                                    texts: {
                                        ...textsMultiLanguage[languageEnum]
                                            .texts,
                                        privacyPolicyDisclaimer: get(
                                            translations,
                                            'texts.privacyPolicyDisclaimer',
                                        ),
                                    },
                                },
                            }
                        }

                        const textsSelectedLanguage =
                            textsMultiLanguage[languageEnum]
                        setInitialTexts(textsMultiLanguage)
                        initialTextsOfSelectedLanguageRef.current =
                            textsSelectedLanguage
                        form.reset(textsSelectedLanguage)
                    }

                    setTextsLoadingState(LoadingState.LOADED)
                },
            )
        }
    }, [
        textsLoadingState,
        translationsLoadingState,
        integrationDefaultLanguage,
        language,
        initialTexts,
        integration,
        integrationChat,
        translations,
        form,
    ])

    const migrateNonLocalizedTextsIfNeeded = useCallback(() => {
        const currentValues = form.getValues()
        const migratedValues = { ...currentValues }
        let migrated = false

        if (
            !currentValues.texts?.introductionText &&
            integrationChat.decoration.introduction_text
        ) {
            migratedValues.texts = {
                ...migratedValues.texts,
                introductionText: integrationChat.decoration.introduction_text,
            }
            migrated = true
        }

        if (
            !currentValues.texts?.offlineIntroductionText &&
            integrationChat.decoration.offline_introduction_text
        ) {
            migratedValues.texts = {
                ...migratedValues.texts,
                offlineIntroductionText:
                    integrationChat.decoration.offline_introduction_text,
            }
            migrated = true
        }

        if (!currentValues.texts?.chatTitle && integrationChat.name) {
            migratedValues.texts = {
                ...migratedValues.texts,
                chatTitle: integrationChat.name,
            }
            migrated = true
        }

        if (
            !currentValues.texts?.chatWithUs &&
            integrationChat.decoration.launcher?.label
        ) {
            migratedValues.texts = {
                ...migratedValues.texts,
                chatWithUs: integrationChat.decoration.launcher.label,
            }
            migrated = true
        }

        if (migrated) {
            initialTextsOfSelectedLanguageRef.current = migratedValues
            form.reset(migratedValues)
        }
    }, [form, integrationChat])

    useEffect(() => {
        if (
            dependenciesLoaded &&
            integrationDefaultLanguage === language?.get('value')
        ) {
            migrateNonLocalizedTextsIfNeeded()
        }
    }, [
        dependenciesLoaded,
        integrationDefaultLanguage,
        language,
        migrateNonLocalizedTextsIfNeeded,
    ])

    const handleLanguageChange = (
        selectedLanguage: LanguageChat,
        calledFromConfirmationModal = false,
    ) => {
        if (hasChanges && !calledFromConfirmationModal) {
            openLanguageChangeModal(selectedLanguage)
            return
        }

        setTranslationsLoadingState(LoadingState.NOT_LOADED)
        setLanguage(getSelectedLanguage(selectedLanguage))
        setHasChanges(false)

        const textsOfSelectedLanguageValue = (
            initialTexts as TextsMultiLanguage
        )[selectedLanguage]
        initialTextsOfSelectedLanguageRef.current = textsOfSelectedLanguageValue
        form.reset(textsOfSelectedLanguageValue)
    }

    const isDefaultLanguageLoaded = useMemo(() => {
        if (!language || !integrationDefaultLanguage) {
            return false
        }
        return integrationDefaultLanguage === language?.get('value')
    }, [integrationDefaultLanguage, language])

    const backUrl = `/app/settings/channels/gorgias_chat/${
        integration.get('id') as number
    }/languages`

    const emailCaptureEnforcementValue = integration.getIn([
        'meta',
        'preferences',
        'email_capture_enforcement',
    ])
    const emailCaptureEnforcement =
        typeof emailCaptureEnforcementValue === 'string'
            ? emailCaptureEnforcementValue
            : undefined

    const dispatchNotification = useCallback(
        (
            message: string,
            status: NotificationStatus = NotificationStatus.Success,
        ) => {
            void dispatch(
                notify({
                    status,
                    message: message,
                }),
            )
        },
        [dispatch],
    )

    const saveKeyValue = useCallback(
        (key: string, value: string) => {
            form.setValue(key as Path<TextsPerLanguage>, value || '')
            setHasChanges(
                !isEqual(
                    form.getValues(),
                    initialTextsOfSelectedLanguageRef.current,
                ),
            )
        },
        [form],
    )

    const saveApplicationTexts = useCallback(async (): Promise<void> => {
        const applicationId = integrationChat.meta.app_id
        if (!applicationId) return

        const currentValues = form.getValues()
        const processedTranslations: TextsPerLanguage =
            deleteUnusedKeys(currentValues)

        const languageKey = language?.get('value') as LanguageChat
        const mergedData = {
            ...initialTexts,
            [languageKey]: processedTranslations,
        }
        await updateApplicationTexts({ applicationId, texts: mergedData })

        if (isDefaultLanguageLoaded) {
            let newDecoration = {
                ...integrationChat.decoration,
                introduction_text: currentValues.texts.introductionText,
                offline_introduction_text:
                    currentValues.texts.offlineIntroductionText,
            }
            if (
                integrationChat.decoration.launcher?.type ===
                GorgiasChatLauncherType.ICON_AND_LABEL
            ) {
                newDecoration = {
                    ...newDecoration,
                    launcher: {
                        type: GorgiasChatLauncherType.ICON_AND_LABEL,
                        label: currentValues.texts.chatWithUs,
                    },
                }
            }

            await dispatch(
                IntegrationsActions.updateOrCreateIntegration(
                    fromJS({
                        ...integrationChat,
                        name: currentValues.texts.chatTitle,
                        decoration: newDecoration,
                    }),
                    undefined,
                    undefined,
                    undefined,
                    true,
                ),
            )
            setTranslations({
                ...translations,
                texts: {
                    ...translations.texts,
                    chatTitle: `${currentValues.texts.chatTitle} (chat title)`,
                },
            })
        }
    }, [
        form,
        initialTexts,
        language,
        isDefaultLanguageLoaded,
        integrationChat,
        dispatch,
        translations,
        updateApplicationTexts,
    ])

    const resetValues = useCallback(() => {
        form.reset(initialTextsOfSelectedLanguageRef.current)
        setHasChanges(false)
        dispatchNotification('Discarded changes')
    }, [form, dispatchNotification])

    const submitData = useCallback(async () => {
        try {
            await saveApplicationTexts()

            const savedValues = form.getValues()

            if (language) {
                const languageKey = language.get('value') as LanguageChat
                setInitialTexts({
                    ...initialTexts,
                    [languageKey]: savedValues,
                })
                initialTextsOfSelectedLanguageRef.current = savedValues
            } else {
                dispatchNotification(
                    `There was a problem. We couldn't update your changes`,
                    NotificationStatus.Error,
                )
                return
            }

            form.reset(savedValues)
            setHasChanges(false)
            dispatchNotification('Your changes are now live')

            logEvent(SegmentEvent.ChatSettingsToneOfVoicePageSaved, {
                id: integration.get('id'),
            })
        } catch {
            dispatchNotification(
                `There was a problem. We couldn't update your changes`,
                NotificationStatus.Error,
            )
        }
    }, [
        saveApplicationTexts,
        form,
        dispatchNotification,
        integration,
        language,
        initialTexts,
    ])

    const handleBackClick = useCallback(() => {
        if (hasChanges) {
            openExitModal()
        } else {
            history.push(backUrl)
        }
    }, [hasChanges, openExitModal, history, backUrl])

    const onDiscardChangesAndExit = () => {
        form.reset(initialTextsOfSelectedLanguageRef.current)
        setHasChanges(false)
        history.push(backUrl)
    }

    const onSaveValuesAndExit = async () => {
        try {
            await submitData()
            history.push(backUrl)
        } catch {
            dispatchNotification(
                `There was a problem. We couldn't update your changes`,
                NotificationStatus.Error,
            )
        }
    }

    const onDiscardChangesAndSwitchLanguage = () => {
        onCloseModals()
        if (modalState.pendingLanguage) {
            handleLanguageChange(modalState.pendingLanguage, true)
        }
    }

    const onSaveValuesAndSwitchLanguage = async () => {
        try {
            await submitData()
            onCloseModals()
            if (modalState.pendingLanguage) {
                handleLanguageChange(modalState.pendingLanguage, true)
            }
        } catch {
            dispatchNotification(
                `There was a problem. We couldn't update your changes`,
                NotificationStatus.Error,
            )
        }
    }

    return {
        language,
        handleLanguageChange,
        handleBackClick,
        languagePickerLanguages,
        textsOfSelectedLanguage: form.getValues(),
        translations,
        dependenciesLoaded,
        hasChanges,
        isSubmitting,
        submitData,
        resetValues,
        saveKeyValue,
        backUrl,
        isDefaultLanguageLoaded,
        isAutomateSubscriber,
        isExitModalOpen,
        isLanguageChangeModalOpen,
        onCloseModals,
        onDiscardChangesAndExit,
        onSaveValuesAndExit,
        onDiscardChangesAndSwitchLanguage,
        onSaveValuesAndSwitchLanguage,
        emailCaptureEnforcement,
        integrationChat,
    }
}
