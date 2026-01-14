import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { Map } from 'immutable'
import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import type { Language } from 'constants/languages'
import { IntegrationType } from 'models/integration/constants'
import type { Option as DropdownOption } from 'pages/common/components/DropdownButtonWithSearch/DropdownButtonWithSearch'
import DropdownButtonWithSearch from 'pages/common/components/DropdownButtonWithSearch/DropdownButtonWithSearch'
import PageHeader from 'pages/common/components/PageHeader'
import PageHeaderRevamped from 'pages/common/components/PageHeaderRevamped'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader'
import { Tab } from 'pages/integrations/integration/types'

import { GorgiasChatIntegrationLanguagesTable } from './components/GorgiasChatIntegrationLanguagesTable'
import { GorgiasChatIntegrationLanguagesTableRow } from './components/GorgiasChatIntegrationLanguagesTable/GorgiasChatIntegrationLanguagesTableRow'
import { useGorgiasChatIntegrationLanguagesTable } from './components/GorgiasChatIntegrationLanguagesTable/useGorgiasChatIntegrationLanguagesTable'

type GorgiasChatIntegrationLanguagesProps = {
    integration: Map<any, any>
    loading: Map<any, any>
}

const GorgiasChatIntegrationLanguages = ({
    integration,
    loading,
}: GorgiasChatIntegrationLanguagesProps) => {
    const isRevampEnabled = useFlag(FeatureFlagKey.ChatSettingsRevamp)
    const {
        languagesAvailable,
        languagesRows,
        addLanguage,
        updateDefaultLanguage,
        deleteLanguage,
    } = useGorgiasChatIntegrationLanguagesTable({
        integration,
        loading,
    })

    const onAddLanguage = async (option: DropdownOption) => {
        await addLanguage({ language: option.value as Language })
    }

    return (
        <div className="full-width">
            {isRevampEnabled ? (
                <PageHeaderRevamped
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link
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
                >
                    <DropdownButtonWithSearch
                        label="Add Language"
                        options={languagesAvailable}
                        variant="primary"
                        withLargeMenu
                        onSelectOptionChange={onAddLanguage}
                    />
                </PageHeaderRevamped>
            ) : (
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link
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
                >
                    <DropdownButtonWithSearch
                        label="Add Language"
                        options={languagesAvailable}
                        variant="primary"
                        withLargeMenu
                        onSelectOptionChange={onAddLanguage}
                    />
                </PageHeader>
            )}

            <GorgiasChatIntegrationHeader
                integration={integration}
                tab={Tab.Languages}
            />

            <GorgiasChatIntegrationLanguagesTable>
                {languagesRows.map((languageRow) => (
                    <GorgiasChatIntegrationLanguagesTableRow
                        key={languageRow.language}
                        language={languageRow}
                        onClickSetDefault={updateDefaultLanguage}
                        onClickDelete={deleteLanguage}
                    />
                ))}
            </GorgiasChatIntegrationLanguagesTable>
        </div>
    )
}

export default GorgiasChatIntegrationLanguages
