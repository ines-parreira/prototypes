import {useEffect, useMemo, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {List, Map, fromJS} from 'immutable'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {Language} from 'constants/languages'
import {
    mapLanguageOptionsToLanguageDropdown,
    GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS,
    LanguageItem,
} from 'config/integrations/gorgias_chat'
import useAppDispatch from 'hooks/useAppDispatch'
import {IntegrationType} from 'models/integration/constants'
import {updateOrCreateIntegration} from 'state/integrations/actions'

import {FeatureFlagKey} from 'config/featureFlags'
import {LanguageItemRow} from './types'

const getLanguageLabel = (languageItem: LanguageItem) => {
    const language = GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.find((el) => {
        return el?.get('value') === languageItem.language
    })

    return language.get('label')
}

type SubmitForm = {
    id?: number
    meta: any
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
    const enableNewLanguages = useFlags()[FeatureFlagKey.EnableNewLanguages]

    const languagesAvailable = useMemo(
        () =>
            mapLanguageOptionsToLanguageDropdown(
                integration,
                enableNewLanguages
            ),
        [integration, enableNewLanguages]
    )

    const languagesRows: LanguageItemRow[] = useMemo(() => {
        if (loading.get('integration')) {
            return []
        }

        const integrationId: number = integration.get('id')

        return languages.map((language) => ({
            ...language,
            label: getLanguageLabel(language),
            link: `/app/settings/channels/${IntegrationType.GorgiasChat}/${integrationId}/languages/${language.language}`,
            showActions: languages.length > 1,
        }))
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

    const [{loading: isUpdatePending}, handleUpdate] = useAsyncFn(
        async (updatedLanguages: LanguageItem[]) => {
            const form: SubmitForm = {
                id: integration.get('id'),
                meta: {},
            }

            const meta: Map<any, any> = integration.get('meta')
            const defaultLanguage = updatedLanguages.find(
                (lang) => !!lang.primary
            )
            form.meta = meta
                .set(
                    'language',
                    defaultLanguage?.language ?? Language.EnglishUs
                )
                .set('languages', updatedLanguages)

            await dispatch(updateOrCreateIntegration(fromJS(form)))
            setLanguages(updatedLanguages)
        },
        [integration]
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
                currentLanguage.language !== deletedLanguage.language
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
