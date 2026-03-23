import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'

import {
    Button,
    ButtonIntent,
    ButtonSize,
    ButtonVariant,
    ListItem,
    Select,
} from '@gorgias/axiom'

import type { LanguageItem } from 'config/integrations/gorgias_chat'
import type { Language } from 'constants/languages'
import { useGorgiasChatCreationWizardContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { LanguagesCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationLanguages/LanguagesCard/LanguagesCard'
import { useLanguagesTable } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationLanguages/useLanguagesTable'
import { GorgiasChatRevampLayout } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatRevampLayout'

import css from './components/GorgiasChatIntegrationLanguages/GorgiasChatIntegrationLanguages.less'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
}

export const GorgiasChatIntegrationLanguagesRevamp = ({
    integration,
    loading,
}: Props) => {
    const {
        languagesAvailable,
        languagesRows,
        isUpdatePending,
        addLanguage,
        updateDefaultLanguage,
        deleteLanguage,
    } = useLanguagesTable({
        integration,
        loading,
    })

    const { updateLanguage } = useGorgiasChatCreationWizardContext()

    const shopIntegrationId = integration.getIn(['meta', 'shop_integration_id'])
        ? Number(integration.getIn(['meta', 'shop_integration_id']))
        : undefined
    const shopifyIntegrationIds: List<number> = integration.getIn(
        ['meta', 'shopify_integration_ids'],
        fromJS([]),
    )
    const isOneClickInstallation = shopIntegrationId
        ? shopifyIntegrationIds.includes(shopIntegrationId)
        : undefined

    const onAddLanguage = async (option: { value: string; label: string }) => {
        await addLanguage({ language: option.value as Language })
    }

    const handleUpdateDefaultLanguage = async (language: LanguageItem) => {
        await updateDefaultLanguage(language)
        await updateLanguage(language.language)
    }

    return (
        <GorgiasChatRevampLayout integration={integration}>
            <div className={css.languagesTab}>
                <div className={css.addLanguageWrapper}>
                    <Select
                        items={languagesAvailable}
                        keyName="value"
                        isSearchable
                        selectedItem={null}
                        onSelect={onAddLanguage}
                        isDisabled={isUpdatePending}
                        trigger={({ ref }) => (
                            <Button
                                ref={ref}
                                size={ButtonSize.Md}
                                variant={ButtonVariant.Primary}
                                intent={ButtonIntent.Regular}
                                isDisabled={isUpdatePending}
                            >
                                Add Language
                            </Button>
                        )}
                    >
                        {(option) => (
                            <ListItem id={option.value} label={option.label} />
                        )}
                    </Select>
                </div>
                <LanguagesCard
                    languagesRows={languagesRows}
                    isUpdatePending={isUpdatePending}
                    isOneClickInstallation={isOneClickInstallation}
                    onClickSetDefault={handleUpdateDefaultLanguage}
                    onClickDelete={async (language, onSuccess) => {
                        await deleteLanguage(language)
                        onSuccess?.()
                    }}
                />
            </div>
        </GorgiasChatRevampLayout>
    )
}
