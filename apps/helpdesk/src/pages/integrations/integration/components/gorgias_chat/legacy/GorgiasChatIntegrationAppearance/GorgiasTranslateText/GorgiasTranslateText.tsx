import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { produce } from 'immer'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { get, set } from 'lodash'
import { connect } from 'react-redux'
import { Link, useHistory, useLocation } from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Form,
    Row,
} from 'reactstrap'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import {
    getLanguagesFromChatConfig,
    getPrimaryLanguageFromChatConfig,
    GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS,
    isTextsMultiLanguage,
    mapIntegrationLanguagesToLanguagePicker,
} from 'config/integrations/gorgias_chat'
import { GORGIAS_CHAT_INTEGRATION_TYPE } from 'constants/integration'
import { LanguageChat } from 'constants/languages'
import useAppDispatch from 'hooks/useAppDispatch'
import type { GorgiasChatIntegration } from 'models/integration/types'
import {
    GorgiasChatLauncherType,
    IntegrationType,
} from 'models/integration/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import { FlagLanguageItem } from 'pages/common/components/LanguageBulletList'
import PageHeader from 'pages/common/components/PageHeader'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader'
import useIsAutomateSubscriber from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsAutomateSubscriber'
import useIntegrationPageViewLogEvent from 'pages/integrations/integration/hooks/useIntegrationPageViewLogEvent'
import type {
    Texts,
    TextsLegacyMonoLanguage,
    TextsMultiLanguage,
    TextsPerLanguage,
    Translations,
} from 'rest_api/gorgias_chat_protected_api/types'
import { getHasAutomate } from 'state/billing/selectors'
import * as IntegrationsActions from 'state/integrations/actions'
import * as integrationSelectors from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { RootState } from 'state/types'

import GorgiasTranslateExitModal from './GorgiasTranslateExitModal'
import GorgiasTranslateInputGroup from './GorgiasTranslateInputGroup'
import GorgiasTranslateTextBackLink from './GorgiasTranslateTextBackLink'
import translationsAvailableKeys, {
    deleteUnusedKeys,
} from './translations-available-keys'
import isEqualTextsPerLanguage from './utils/CompareTextsPerLanguage'

import css from './GorgiasTranslateText.less'

const generalKeys = Object.keys(translationsAvailableKeys.general)
const generalLegacySoloLanguage = Object.keys(
    translationsAvailableKeys.generalLegacySoloLanguage,
)
const introKeys = Object.keys(translationsAvailableKeys.intro)
const contactFormKeys = Object.keys(translationsAvailableKeys.contactForm)
const contactFormComfirmationEmailKeys = Object.keys(
    translationsAvailableKeys.contactFormConfirmationEmail,
)
const dynamicWaitTimeKeys = Object.keys(
    translationsAvailableKeys.dynamicWaitTime,
)
const emailCaptureKeys = Object.keys(translationsAvailableKeys.emailCapture)
const autoResponderKeys = Object.keys(translationsAvailableKeys.autoResponder)
const privacyPolicyDisclaimerKeys = Object.keys(
    translationsAvailableKeys.privacyPolicyDisclaimer,
)

type OwnProps = {
    integration: Map<any, any>
}

const mapStateToProps = (state: RootState) => {
    return {
        domain: state.currentAccount.get('domain'),
        hasAutomate: getHasAutomate(state),
        getIntegrationsByTypes:
            integrationSelectors.makeGetIntegrationsByTypes(state),
        gorgiasChatExtraState:
            integrationSelectors.getIntegrationTypeExtraState(
                GORGIAS_CHAT_INTEGRATION_TYPE as IntegrationType,
            )(state),
    }
}
const mapDispatchToProps = {}

enum LoadingState {
    NOT_LOADED = 'not-loaded',
    LOADING = 'loading',
    LOADED = 'loaded',
}

export const multiLanguageInitialTextsEmptyData: TextsMultiLanguage =
    Object.values(LanguageChat).reduce(
        (acc, lang) => ({
            ...acc,
            [lang as string]: {
                texts: {},
                sspTexts: {},
                meta: {},
            } as TextsPerLanguage,
        }),
        {} as TextsMultiLanguage,
    )

function GorgiasTranslateText({
    integration,
}: OwnProps & ReturnType<typeof mapStateToProps>) {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const location = useLocation()
    useIntegrationPageViewLogEvent(
        SegmentEvent.ChatSettingsToneOfVoicePageViewed,
        {
            isReady: !!integration,
            integration,
        },
    )

    const renameContactFormEnabled = useFlag(
        FeatureFlagKey.ChatRenameContactForm,
    )
    const privacyPolicyDisclaimerFeatureFlagEnabled = useFlag(
        FeatureFlagKey.ChatPrivacyPolicyDisclaimer,
    )

    const integrationChat = integration.toJS() as GorgiasChatIntegration

    const isAutomateSubscriber = useIsAutomateSubscriber(integrationChat)

    const segments = location.pathname.split('/')
    const [lastSegment, setLastSegment] = useState<string | undefined>(
        undefined,
    )
    const [language, setLanguage] = useState<Map<string, string> | null>(null)
    const [hasChanges, setHasChanges] = useState(false)
    const [isExitModalOpen, setIsExitModalOpen] = useState(false)
    const [isLanguageChangeModalOpen, setIsLanguageChangeModalOpen] =
        useState(false)
    const [preModalSelectedLanguage, setPreModalSelectedLanguage] =
        useState<LanguageChat | null>(null)
    const [showWarning, setShowWarning] = useState(true)
    const [translations, setTranslations] = useState<Translations>({
        texts: {},
        sspTexts: {},
        meta: {},
    })

    useEffectOnce(() => {
        setLastSegment(segments.pop() || (segments.pop() as string)) // Handle potential trailing slash.
    })

    const IsLegacyMonoLanguageMode = lastSegment === 'texts'

    // Store the the initial state of the full multi-language format. Or is just a copy of initialTextsOfSelectedLanguage if in backward compatible mode.
    const [initialTexts, setInitialTexts] = useState<Texts>(
        IsLegacyMonoLanguageMode
            ? {
                  texts: {},
                  sspTexts: {},
                  meta: {},
              }
            : multiLanguageInitialTextsEmptyData,
    )

    // Store the initial state texts of the selected language.
    const [initialTextsOfSelectedLanguage, setInitialTextsOfSelectedLanguage] =
        useState<TextsPerLanguage>({
            texts: {},
            sspTexts: {},
            meta: {},
        })
    // Store the local texts changes of the selected language.
    const [textsOfSelectedLanguage, setTextsOfSelectedLanguage] =
        useState<TextsPerLanguage>(initialTextsOfSelectedLanguage)

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

        if (IsLegacyMonoLanguageMode) {
            return getSelectedLanguage(
                integrationDefaultLanguage as LanguageChat,
            )
        }

        if (integrationLanguages.includes(lastSegment)) {
            return getSelectedLanguage(lastSegment as LanguageChat)
        }
        return getSelectedLanguage(integrationDefaultLanguage as LanguageChat)
    }, [
        integrationDefaultLanguage,
        integrationLanguages,
        lastSegment,
        IsLegacyMonoLanguageMode,
    ])

    const dependenciesLoaded = useMemo(() => {
        return (
            translationsLoadingState === LoadingState.LOADED &&
            textsLoadingState === LoadingState.LOADED
        )
    }, [textsLoadingState, translationsLoadingState])

    // useEffect(() => {
    //     if (language && integration?.get('id')) {
    //         history.replace(
    //             `/app/settings/channels/gorgias_chat/${
    //                 integration.get('id') as number
    //             }/languages/${language.get('value')}`
    //         )
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [integration, language])

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
                if (IsLegacyMonoLanguageMode) {
                    setTranslations(data)
                } else {
                    setTranslations({
                        ...data,
                        // Customize the chat title and launcher label key value.

                        texts: {
                            ...data.texts,
                            chatTitle: `${integrationChat.name} (chat title)`,
                            chatWithUs: `${data.texts.chatWithUs} (launcher label)`,
                        },
                    })
                }
                setTranslationsLoadingState(LoadingState.LOADED)
            })
        }

        const applicationId: string = integration.getIn(['meta', 'app_id'])
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
                        if (IsLegacyMonoLanguageMode) {
                            // Keep using the legacy mono-language format.
                            setInitialTexts(data as TextsLegacyMonoLanguage)
                            setInitialTextsOfSelectedLanguage(
                                data as TextsPerLanguage,
                            )
                            setTextsOfSelectedLanguage(data as TextsPerLanguage)
                        } else {
                            // Upgrade from legacy mono-language to to multi-language format.
                            const textsMultiLanguage: TextsMultiLanguage = {
                                ...multiLanguageInitialTextsEmptyData,
                                [integrationDefaultLanguage as LanguageChat]:
                                    data as TextsPerLanguage,
                            }
                            setInitialTexts(textsMultiLanguage)
                            const textsOfSelectedLanguage =
                                textsMultiLanguage[
                                    language.get('value') as LanguageChat
                                ]
                            setInitialTextsOfSelectedLanguage(
                                textsOfSelectedLanguage,
                            )
                            setTextsOfSelectedLanguage(textsOfSelectedLanguage)
                        }
                    } else {
                        // Merge existing TextsMultiLanguage data to multiLanguageInitialTextsEmptyData to ensure all languages are present.
                        let textsMultiLanguage: TextsMultiLanguage = {
                            ...multiLanguageInitialTextsEmptyData,
                            ...(data as TextsMultiLanguage),
                        }

                        const languageEnum = language.get(
                            'value',
                        ) as LanguageChat

                        // Set Privacy policy disclaimer text if missing and needed, to avoid blocking the user with a required field empty.
                        // This can occurs when switching the primary language.
                        if (
                            integrationChat.meta.preferences
                                ?.privacy_policy_disclaimer_enabled &&
                            !textsMultiLanguage[languageEnum].texts
                                .privacyPolicyDisclaimer
                        ) {
                            textsMultiLanguage = produce(
                                textsMultiLanguage,
                                (textsDraft) => {
                                    set(
                                        textsDraft,
                                        `${languageEnum}.texts.privacyPolicyDisclaimer`,
                                        get(
                                            translations,
                                            'texts.privacyPolicyDisclaimer',
                                        ),
                                    )
                                },
                            )
                        }

                        const textsSelectedLanguage =
                            textsMultiLanguage[languageEnum]
                        setInitialTexts(textsMultiLanguage)
                        setInitialTextsOfSelectedLanguage(textsSelectedLanguage)
                        setTextsOfSelectedLanguage(textsSelectedLanguage)
                    }

                    setTextsLoadingState(LoadingState.LOADED)
                },
            )
        }
    }, [
        textsLoadingState,
        translationsLoadingState,
        IsLegacyMonoLanguageMode,
        integrationDefaultLanguage,
        language,
        initialTexts,
        integration,
        integrationChat,
        translations,
    ])

    /**
     * Migrate the legacy texts we have in decoration to the Tone of Voice,
     * when Tone of Voice don't have the texts yet (decoration texts are always present by default).
     * We're also migrating the chat integration name if needed, that is not exactly legacy but still localized.
     */
    const migrateNonLocalizedTextsIfNeeded = () => {
        const introductionTextFromToneOfVoice: string | undefined =
            textsOfSelectedLanguage.texts?.introductionText
        const offlineIntroductionTextFromToneOfVoice: string | undefined =
            textsOfSelectedLanguage.texts?.offlineIntroductionText
        const chatTitleFromToneOfVoice: string | undefined =
            textsOfSelectedLanguage.texts?.chatTitle
        const chatWithUsFromToneOfVoice: string | undefined =
            textsOfSelectedLanguage.texts?.chatWithUs

        let newTextsOfSelectedLanguage = textsOfSelectedLanguage
        if (
            !introductionTextFromToneOfVoice &&
            integrationChat.decoration.introduction_text
        ) {
            newTextsOfSelectedLanguage = produce(
                newTextsOfSelectedLanguage,
                (textsDraft) => {
                    set(
                        textsDraft,
                        `texts.introductionText`,
                        integrationChat.decoration.introduction_text,
                    )
                },
            )
        }

        if (
            !offlineIntroductionTextFromToneOfVoice &&
            integrationChat.decoration.offline_introduction_text
        ) {
            newTextsOfSelectedLanguage = produce(
                newTextsOfSelectedLanguage,
                (textsDraft) => {
                    set(
                        textsDraft,
                        `texts.offlineIntroductionText`,
                        integrationChat.decoration.offline_introduction_text,
                    )
                },
            )
        }
        if (!chatTitleFromToneOfVoice && integrationChat.name) {
            newTextsOfSelectedLanguage = produce(
                newTextsOfSelectedLanguage,
                (textsDraft) => {
                    set(textsDraft, `texts.chatTitle`, integrationChat.name)
                },
            )
        }
        if (
            !chatWithUsFromToneOfVoice &&
            integrationChat.decoration.launcher?.label
        ) {
            newTextsOfSelectedLanguage = produce(
                newTextsOfSelectedLanguage,
                (textsDraft) => {
                    set(
                        textsDraft,
                        `texts.chatWithUs`,
                        integrationChat.decoration.launcher?.label,
                    )
                },
            )
        }

        setTextsOfSelectedLanguage(newTextsOfSelectedLanguage)
    }

    useEffect(() => {
        if (
            dependenciesLoaded &&
            !IsLegacyMonoLanguageMode &&
            integrationDefaultLanguage === language?.get('value')
        ) {
            migrateNonLocalizedTextsIfNeeded()
        }
        /* eslint-disable react-hooks/exhaustive-deps */
    }, [
        IsLegacyMonoLanguageMode,
        dependenciesLoaded,
        integrationDefaultLanguage,
        language,
    ]) /* eslint-enable react-hooks/exhaustive-deps */

    const handleLanguageChange = (
        language: LanguageChat,
        calledFromConfirmationModal = false,
    ) => {
        if (hasChanges && !calledFromConfirmationModal) {
            setPreModalSelectedLanguage(language)
            setIsLanguageChangeModalOpen(true)
            return
        }

        setTranslationsLoadingState(LoadingState.NOT_LOADED)
        setLanguage(getSelectedLanguage(language))

        // Reload the correct language customized texts.
        const textsOfSelectedLanguage = (initialTexts as TextsMultiLanguage)[
            language
        ]
        setInitialTextsOfSelectedLanguage(textsOfSelectedLanguage)
        setTextsOfSelectedLanguage(textsOfSelectedLanguage)
    }

    const isDefaultLanguageLoaded = useMemo(() => {
        if (!language || !integrationDefaultLanguage) {
            return false
        }
        return integrationDefaultLanguage === language?.get('value')
    }, [integrationDefaultLanguage, language])

    const backUrl = IsLegacyMonoLanguageMode
        ? `/app/settings/channels/gorgias_chat/${
              integration.get('id') as number
          }/appearance`
        : `/app/settings/channels/gorgias_chat/${
              integration.get('id') as number
          }/languages`

    const emailCaptureEnforcement = integration.getIn([
        'meta',
        'preferences',
        'email_capture_enforcement',
    ])
    const filterForlEmailCaptureKeys = { emailCaptureEnforcement }

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

    const onClickToExit = useCallback(
        (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
            event.preventDefault()
            if (hasChanges) {
                setIsExitModalOpen(true)
            } else {
                history.push(backUrl)
            }
        },
        [hasChanges, history, backUrl],
    )

    const closeWarning = () => {
        setShowWarning(false)
    }

    const saveKeyValue = useCallback(
        (key: string, value: string) => {
            const draft = produce(textsOfSelectedLanguage, (textsDraft) => {
                set(textsDraft, key, value || undefined)
            })

            // We only flag as changed if the current state is different from the one in DB.
            // We do this because focusing and unfocusing a field (both <TextArea/> and <TicketRichField/>) without editing will trigger a saveKeyValue() call.
            if (!isEqualTextsPerLanguage(draft, textsOfSelectedLanguage)) {
                setHasChanges(true)
                setTextsOfSelectedLanguage(draft)
            }
        },
        [textsOfSelectedLanguage, setTextsOfSelectedLanguage, setHasChanges],
    )

    const updateApplicationTexts = useCallback(async (): Promise<void> => {
        const applicationId: string = integration.getIn(['meta', 'app_id'])

        const processedTranslations: TextsPerLanguage = deleteUnusedKeys(
            textsOfSelectedLanguage,
        )

        if (IsLegacyMonoLanguageMode) {
            await IntegrationsActions.updateApplicationTexts(
                applicationId,
                processedTranslations,
            )
        } else {
            const mergedData = {
                ...initialTexts,
                [language?.get('value') as LanguageChat]: processedTranslations,
            }
            await IntegrationsActions.updateApplicationTexts(
                applicationId,
                mergedData,
            )
            // When updating the default language copy, we need to update the integration decoration + name as well.
            // It's important for integration.name, and less for decoration but we can sync until we fully drop the decoration texts.
            if (!IsLegacyMonoLanguageMode && isDefaultLanguageLoaded) {
                // NOTE. With isDefaultLanguageLoaded=true, `introductionText`, `offlineIntroductionText`, `chatWithUs` and `chatTitle`
                // cannot be empty as they are marked as required.
                let newDecoration = {
                    ...integrationChat.decoration,
                    introduction_text:
                        textsOfSelectedLanguage.texts.introductionText,
                    offline_introduction_text:
                        textsOfSelectedLanguage.texts.offlineIntroductionText,
                }
                if (
                    integrationChat.decoration.launcher?.type ===
                    GorgiasChatLauncherType.ICON_AND_LABEL
                ) {
                    newDecoration = {
                        ...newDecoration,
                        launcher: {
                            type: GorgiasChatLauncherType.ICON_AND_LABEL,
                            label: textsOfSelectedLanguage.texts.chatWithUs,
                        },
                    }
                }

                await dispatch(
                    IntegrationsActions.updateOrCreateIntegration(
                        fromJS({
                            ...integrationChat,
                            name: textsOfSelectedLanguage.texts.chatTitle,
                            decoration: newDecoration,
                        }),
                        undefined,
                        undefined,
                        undefined,
                        true, //disableSuccessNotification // TODO. Refactor updateOrCreateIntegration to use a options object.
                    ),
                )
                // Update the translations to reflect the new integration name in the page.
                setTranslations({
                    ...translations,
                    texts: {
                        ...translations.texts,
                        chatTitle: `${textsOfSelectedLanguage.texts.chatTitle} (chat title)`,
                    },
                })
            }
        }
    }, [
        integration,
        IsLegacyMonoLanguageMode,
        textsOfSelectedLanguage,
        initialTexts,
        language,
        isDefaultLanguageLoaded,
        integrationChat,
        dispatch,
        translations,
    ])

    const resetValues = useCallback(() => {
        setTextsOfSelectedLanguage({ ...initialTextsOfSelectedLanguage })
        setHasChanges(false)
        dispatchNotification('Discarded changes')
    }, [
        setTextsOfSelectedLanguage,
        setHasChanges,
        initialTextsOfSelectedLanguage,
        dispatchNotification,
    ])

    const submitData = useCallback(
        async (evt?: React.FormEvent<HTMLElement>) => {
            evt?.preventDefault()

            try {
                await updateApplicationTexts()

                if (IsLegacyMonoLanguageMode) {
                    setInitialTexts(textsOfSelectedLanguage)
                    setInitialTextsOfSelectedLanguage(textsOfSelectedLanguage)
                } else {
                    if (language) {
                        setInitialTexts({
                            ...initialTexts,
                            [language?.get('value') as LanguageChat]:
                                textsOfSelectedLanguage,
                        })
                        setInitialTextsOfSelectedLanguage(
                            textsOfSelectedLanguage,
                        )
                    } else {
                        dispatchNotification(
                            `There was a problem. We couldn't update your changes`,
                            NotificationStatus.Error,
                        )
                        return
                    }
                }

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
        },
        [
            updateApplicationTexts,
            IsLegacyMonoLanguageMode,
            dispatchNotification,
            integration,
            textsOfSelectedLanguage,
            language,
            initialTexts,
        ],
    )

    const trackInput = useCallback(
        (key: string) => {
            logEvent(SegmentEvent.ChatSettingsToneOfVoiceFieldClicked, {
                id: integration.get('id'),
                key_value: key,
            })
        },
        [integration],
    )

    const onDiscardChangesAndExit = () => {
        setTextsOfSelectedLanguage({ ...initialTextsOfSelectedLanguage })
        setHasChanges(false)
        history.push(backUrl)
    }

    const onSaveValuesAndExit = async () => {
        try {
            await submitData()
            setHasChanges(false)
            history.push(backUrl)
        } catch {
            dispatchNotification(
                `There was a problem. We couldn't update your changes`,
                NotificationStatus.Error,
            )
        }
    }

    const onDiscardChangesAndSwitchLanguage = () => {
        setHasChanges(false)
        onCloseModals()
        if (preModalSelectedLanguage) {
            handleLanguageChange(preModalSelectedLanguage, true)
        }
    }

    const onSaveValuesAndSwitchLanguage = async () => {
        try {
            await submitData()
            setHasChanges(false)
            onCloseModals()
            if (preModalSelectedLanguage) {
                handleLanguageChange(preModalSelectedLanguage, true)
            }
        } catch {
            dispatchNotification(
                `There was a problem. We couldn't update your changes`,
                NotificationStatus.Error,
            )
        }
    }

    const onCloseModals = () => {
        setIsExitModalOpen(false)
        setIsLanguageChangeModalOpen(false)
        setPreModalSelectedLanguage(null)
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                onClick={onClickToExit}
                                to={`/app/settings/channels/${IntegrationType.GorgiasChat}`}
                            >
                                Chat
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.get('name')}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <GorgiasChatIntegrationHeader integration={integration} />

            <Container fluid className={css.pageContainer}>
                <Row>
                    <Col className={css.pageColumn} md="8">
                        <Row>
                            <Col className={css.pageColumn} md="6">
                                <GorgiasTranslateTextBackLink
                                    url={backUrl}
                                    onClick={onClickToExit}
                                />
                            </Col>
                            <Col className={css.pageColumn} md="6">
                                <div
                                    className={
                                        IsLegacyMonoLanguageMode
                                            ? css.languageSectionLegacy
                                            : css.languageSection
                                    }
                                >
                                    {language && (
                                        <div>
                                            {IsLegacyMonoLanguageMode ? (
                                                <span
                                                    className={
                                                        css.flagContainer
                                                    }
                                                >
                                                    <FlagLanguageItem
                                                        key={language.get(
                                                            'value',
                                                        )}
                                                        code={language.get(
                                                            'value',
                                                        )}
                                                        name={language.get(
                                                            'label',
                                                        )}
                                                    />
                                                </span>
                                            ) : (
                                                <div
                                                    className={
                                                        css.selectLanguageContainer
                                                    }
                                                >
                                                    <SelectField
                                                        value={language.get(
                                                            'value',
                                                        )}
                                                        onChange={(language) =>
                                                            handleLanguageChange(
                                                                language as LanguageChat,
                                                            )
                                                        }
                                                        options={
                                                            languagePickerLanguages
                                                        }
                                                        dropdownMenuClassName={
                                                            css.dropdownMenu
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col className={css.pageColumn} md="8">
                        {showWarning && (
                            <Alert
                                className="mb-4"
                                type={AlertType.Warning}
                                icon
                                onClose={closeWarning}
                            >
                                <div>
                                    Any changes made through{' '}
                                    <b>
                                        <a
                                            href="https://docs.gorgias.com/en-US/advanced-customization-new-chat-81792"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            advanced customization
                                        </a>{' '}
                                        will override
                                    </b>{' '}
                                    changes made on this page.
                                </div>
                            </Alert>
                        )}
                    </Col>
                </Row>
            </Container>

            {(dependenciesLoaded && (
                <Form
                    onSubmit={submitData}
                    id="texts-form"
                    onReset={resetValues}
                >
                    <GorgiasTranslateInputGroup
                        title="General"
                        keys={
                            !IsLegacyMonoLanguageMode
                                ? generalKeys
                                : generalLegacySoloLanguage
                        }
                        requiredKeys={
                            !IsLegacyMonoLanguageMode && isDefaultLanguageLoaded
                                ? integrationChat.decoration.launcher?.type ===
                                  GorgiasChatLauncherType.ICON_AND_LABEL
                                    ? ['texts.chatTitle', 'texts.chatWithUs']
                                    : ['texts.chatTitle']
                                : []
                        }
                        filtersForKeys={{}}
                        textsPerLanguage={textsOfSelectedLanguage}
                        translations={translations}
                        saveValue={saveKeyValue}
                        formPropsValues={translationsAvailableKeys.general}
                        trackInputMethod={trackInput}
                    />
                    {!IsLegacyMonoLanguageMode && (
                        <GorgiasTranslateInputGroup
                            title="Intro message"
                            keys={introKeys}
                            requiredKeys={
                                !IsLegacyMonoLanguageMode &&
                                isDefaultLanguageLoaded
                                    ? [
                                          'texts.introductionText',
                                          'texts.offlineIntroductionText',
                                      ]
                                    : []
                            }
                            filtersForKeys={{}}
                            textsPerLanguage={textsOfSelectedLanguage}
                            translations={translations}
                            saveValue={saveKeyValue}
                            formPropsValues={translationsAvailableKeys.intro}
                            trackInputMethod={trackInput}
                        />
                    )}

                    <GorgiasTranslateInputGroup
                        title={
                            renameContactFormEnabled
                                ? 'Offline Capture'
                                : 'Contact Form'
                        }
                        keys={contactFormKeys}
                        filtersForKeys={{}}
                        textsPerLanguage={textsOfSelectedLanguage}
                        translations={translations}
                        saveValue={saveKeyValue}
                        formPropsValues={translationsAvailableKeys.contactForm}
                        trackInputMethod={trackInput}
                    />
                    <GorgiasTranslateInputGroup
                        title={`Offline Capture - Confirmation email`}
                        keys={contactFormComfirmationEmailKeys}
                        filtersForKeys={{}}
                        textsPerLanguage={textsOfSelectedLanguage}
                        translations={translations}
                        saveValue={saveKeyValue}
                        formPropsValues={
                            translationsAvailableKeys.contactFormConfirmationEmail
                        }
                        trackInputMethod={trackInput}
                    />

                    <GorgiasTranslateInputGroup
                        title="Dynamic wait time"
                        keys={dynamicWaitTimeKeys}
                        filtersForKeys={{ isAutomateSubscriber }}
                        isFilteredByActive
                        textsPerLanguage={textsOfSelectedLanguage}
                        translations={translations}
                        saveValue={saveKeyValue}
                        formPropsValues={
                            translationsAvailableKeys.dynamicWaitTime
                        }
                        trackInputMethod={trackInput}
                    />

                    <GorgiasTranslateInputGroup
                        title="Email capture"
                        keys={emailCaptureKeys}
                        filtersForKeys={{
                            ...filterForlEmailCaptureKeys,
                            isAutomateSubscriber,
                        }}
                        isFilteredByActive
                        textsPerLanguage={textsOfSelectedLanguage}
                        translations={translations}
                        saveValue={saveKeyValue}
                        formPropsValues={translationsAvailableKeys.emailCapture}
                        trackInputMethod={trackInput}
                    />

                    <GorgiasTranslateInputGroup
                        title="Auto-reply with wait time"
                        keys={autoResponderKeys}
                        filtersForKeys={{ isAutomateSubscriber }}
                        isFilteredByActive
                        textsPerLanguage={textsOfSelectedLanguage}
                        translations={translations}
                        saveValue={saveKeyValue}
                        formPropsValues={
                            translationsAvailableKeys.autoResponder
                        }
                        trackInputMethod={trackInput}
                    />

                    {privacyPolicyDisclaimerFeatureFlagEnabled && (
                        <GorgiasTranslateInputGroup
                            title="Privacy policy disclaimer"
                            keys={privacyPolicyDisclaimerKeys}
                            filtersForKeys={{}}
                            textsPerLanguage={textsOfSelectedLanguage}
                            translations={translations}
                            saveValue={saveKeyValue}
                            formPropsValues={
                                translationsAvailableKeys.privacyPolicyDisclaimer
                            }
                            trackInputMethod={trackInput}
                            requiredKeys={
                                !IsLegacyMonoLanguageMode &&
                                isDefaultLanguageLoaded &&
                                integrationChat.meta.preferences
                                    ?.privacy_policy_disclaimer_enabled
                                    ? ['texts.privacyPolicyDisclaimer']
                                    : []
                            }
                        />
                    )}

                    <Container fluid className={css.buttonsContainer}>
                        <Button type="submit" color="primary" className="mr-3">
                            Save Changes
                        </Button>
                        <Button type="reset" color="secondary">
                            Discard Changes
                        </Button>
                    </Container>
                </Form>
            )) || (
                <div className={css.spinnerWrapper}>
                    <LoadingSpinner className={css.spinner} />
                </div>
            )}

            <GorgiasTranslateExitModal
                isOpen={isExitModalOpen}
                onClose={onCloseModals}
                onConfirm={onSaveValuesAndExit}
                onDiscard={onDiscardChangesAndExit}
            />
            <GorgiasTranslateExitModal
                isOpen={isLanguageChangeModalOpen}
                onClose={onCloseModals}
                onConfirm={onSaveValuesAndSwitchLanguage}
                onDiscard={onDiscardChangesAndSwitchLanguage}
            />
        </div>
    )
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(GorgiasTranslateText)

function getSelectedLanguage(
    languageValue: LanguageChat,
): Map<string, string> | null {
    if (Object.values(LanguageChat).includes(languageValue)) {
        return GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.find((el) => {
            return el?.get('value') === languageValue
        })
    }

    return null
}
