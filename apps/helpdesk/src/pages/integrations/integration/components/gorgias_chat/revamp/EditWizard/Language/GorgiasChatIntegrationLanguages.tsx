import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'

import {
    Button,
    ButtonIntent,
    ButtonSize,
    ButtonVariant,
    Icon,
    ListItem,
    Select,
} from '@gorgias/axiom'

import type { LanguageItem } from 'config/integrations/gorgias_chat'
import type { LANGUAGE } from 'constants/languages'
import { GorgiasChatRevampLayout } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/GorgiasChatRevampLayout'
import { LanguagesCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Language/components/LanguagesCard/LanguagesCard'
import { useLanguagesTable } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Language/useLanguagesTable'

import css from './GorgiasChatIntegrationLanguages.less'

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
        await addLanguage({ language: option.value as LANGUAGE })
    }

    const handleUpdateDefaultLanguage = async (language: LanguageItem) => {
        await updateDefaultLanguage(language)
    }

    return (
        <GorgiasChatRevampLayout integration={integration}>
            <div className={css.languagesTab}>
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
                                variant={ButtonVariant.Secondary}
                                intent={ButtonIntent.Regular}
                                isDisabled={isUpdatePending}
                                leadingSlot={<Icon name="add-plus" />}
                            >
                                Add language
                            </Button>
                        )}
                    >
                        {(option) => (
                            <ListItem id={option.value} label={option.label} />
                        )}
                    </Select>
                </div>
            </div>
        </GorgiasChatRevampLayout>
    )
}
