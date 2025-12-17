import { useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useAsyncFn } from '@repo/hooks'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'

import type { LanguageItem } from 'config/integrations/gorgias_chat'
import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS,
    GORGIAS_CHAT_WIDGET_TEXTS,
    mapLanguageOptionsToLanguageDropdown,
} from 'config/integrations/gorgias_chat'
import type { Language } from 'constants/languages'
import useAppDispatch from 'hooks/useAppDispatch'
import { IntegrationType } from 'models/integration/constants'
import { GorgiasChatLauncherType } from 'models/integration/types/gorgiasChat'
import { updateOrCreateIntegration } from 'state/integrations/actions'

import type { LanguageItemRow } from './types'

const getLanguageLabel = (languageItem: LanguageItem) => {
    const language = GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.find((el) => {
        return el?.get('value') === languageItem.language
    })

    return language.get('label')
}

type SubmitForm = {
    id?: number
    meta: any
    decoration?: any
}

export type UseGorgiasChatIntegrationLanguagesTableProps = {
    integration: Map<any, any>
    loading: Map<any, any>
}

export const useGorgiasChatIntegrationLanguagesTable = ({
    integration,
    loading,
}: UseGorgiasChatIntegrationLanguagesTableProps) => {
    const [languages, setLanguages] = useState<LanguageItem[]>([])
    const enableNewLanguages = useFlag(FeatureFlagKey.EnableNewLanguages)

    const languagesAvailable = useMemo(
        () =>
            mapLanguageOptionsToLanguageDropdown(
                integration,
                enableNewLanguages,
            ),
        [integration, enableNewLanguages],
    )

    const languagesRows: LanguageItemRow[] = useMemo(() => {
        if (loading.get('integration')) {
            return []
        }

        const integrationId: number = integration.get('id')

        return languages
            .map((language) => ({
                ...language,
                label: getLanguageLabel(language),
                link: `/app/settings/channels/${IntegrationType.GorgiasChat}/${integrationId}/languages/${language.language}`,
                showActions: languages.length > 1,
            }))
            .sort((a, b) => {
                // sort by label first
                if (a.label < b.label) {
                    return -1
                }

                if (b.label < a.label) {
                    return 1
                }

                return 0
            })
            .sort((a, b) => {
                // sort by primary language second
                if (a.primary) {
                    return -1
                }

                if (b.primary) {
                    return 1
                }

                return 0
            })
    }, [loading, integration, languages])

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (loading.get('integration', true)) {
            return
        }

        const integrationLanguage: Language = integration.getIn([
            'meta',
            'language',
        ])
        const integrationLanguages: LanguageItem[] = (
            (integration.getIn(['meta', 'languages']) as List<
                Map<string, string>
            >) || fromJS([])
        ).toJS()

        // We add the legacy 'language' value as default language if no languages are set
        if (!integrationLanguages.length) {
            integrationLanguages.push({
                language: integrationLanguage,
                primary: true,
            })
        }

        setLanguages(integrationLanguages)
    }, [loading, integration])

    const [{ loading: isUpdatePending }, handleUpdate] = useAsyncFn(
        async (updatedLanguages: LanguageItem[]) => {
            const form: SubmitForm = {
                id: integration.get('id'),
                meta: {},
            }

            const meta: Map<any, any> = integration.get('meta')
            const defaultLanguage = updatedLanguages.find(
                (lang) => !!lang.primary,
            )?.language

            if (!defaultLanguage) {
                throw new Error('no default language found.')
            }

            form.meta = meta
                .set('language', defaultLanguage)
                .set('languages', updatedLanguages)

            const initialLanguagesLength =
                (
                    integration.getIn(['meta', 'languages']) as List<
                        Map<string, string>
                    >
                )?.count() ?? 0

            // When changing the default language, we also reset the decoration texts to the new language's defaults.
            // We do this because the initial decoration texts were set using the default language when the chat was created.
            // It's important to note that Tone of Voice overrides any legacy decoration texts. This reset is mainly to ensure that
            // the newly selected language, which may lack Tone of Voice data, doesn't reuse the old decoration texts.
            // See the function migrateNonLocalizedTextsIfNeeded for more details.
            if (initialLanguagesLength === updatedLanguages.length) {
                let decoration: Map<any, any> = integration.get('decoration')
                decoration = decoration.set(
                    'introduction_text',
                    GORGIAS_CHAT_WIDGET_TEXTS[defaultLanguage]
                        ?.introductionText,
                )
                decoration = decoration.set(
                    'offline_introduction_text',
                    GORGIAS_CHAT_WIDGET_TEXTS[defaultLanguage]
                        ?.offlineIntroductionText,
                )

                const launcherType = decoration.getIn(
                    ['launcher', 'type'],
                    GorgiasChatLauncherType.ICON,
                ) as GorgiasChatLauncherType
                if (launcherType === GorgiasChatLauncherType.ICON_AND_LABEL) {
                    decoration = decoration.set('launcher', {
                        type: GorgiasChatLauncherType.ICON_AND_LABEL,
                        label: GORGIAS_CHAT_WIDGET_TEXTS[defaultLanguage]
                            ?.chatWithUs,
                    })
                }
                form.decoration = decoration
            }

            await dispatch(updateOrCreateIntegration(fromJS(form)))
            setLanguages(updatedLanguages)
        },
        [integration],
    )

    const addLanguage = async (newLanguage: LanguageItem) => {
        const newLanguages = languages.concat(newLanguage)

        await handleUpdate(newLanguages)
    }

    const updateDefaultLanguage = async (newDefaultLanguage: LanguageItem) => {
        const newLanguages = languages.map((currentLanguage) => {
            if (currentLanguage.language === newDefaultLanguage.language) {
                return {
                    ...currentLanguage,
                    primary: true,
                }
            }

            return {
                language: currentLanguage.language,
            }
        })

        await handleUpdate(newLanguages)
    }

    const deleteLanguage = async (deletedLanguage: LanguageItem) => {
        const newLanguages = languages.filter(
            (currentLanguage) =>
                currentLanguage.language !== deletedLanguage.language,
        )

        await handleUpdate(newLanguages)
    }

    return {
        languagesAvailable,
        languagesRows,
        isUpdatePending,
        addLanguage,
        updateDefaultLanguage,
        deleteLanguage,
    }
}
