import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS,
    LanguageItem,
} from 'config/integrations/gorgias_chat'
import {IntegrationType} from 'models/integration/constants'
import {LanguageItemRow} from './types'

const getLanguageLabel = (languageItem: LanguageItem) => {
    const language = GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.find((el) => {
        return el?.get('value') === languageItem.language
    })

    return language.get('label')
}

export type UseGorgiasChatIntegrationLanguagesTableProps = {
    integrationId: number
    languages: LanguageItem[]
}

export const useGorgiasChatIntegrationLanguagesTable = ({
    integrationId,
    languages,
}: UseGorgiasChatIntegrationLanguagesTableProps) => {
    const showActions = languages.length > 1

    const languagesRows: LanguageItemRow[] = languages.map((language) => ({
        ...language,
        label: getLanguageLabel(language),
        link: `/app/settings/channels/${IntegrationType.GorgiasChat}/${integrationId}/language/${language.language}`,
        showActions,
    }))

    return {
        languagesRows,
    }
}
