import React from 'react'
import {Link} from 'react-router-dom'
import {Map} from 'immutable'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {Language} from 'constants/languages'
import DropdownButtonWithSearch, {
    Option as DropdownOption,
} from 'pages/common/components/DropdownButtonWithSearch/DropdownButtonWithSearch'
import PageHeader from 'pages/common/components/PageHeader'
import {IntegrationType} from 'models/integration/constants'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader'

import GorgiasChatIntegrationConnectedChannel from '../GorgiasChatIntegrationConnectedChannel'
import {GorgiasChatIntegrationLanguagesTable} from './components/GorgiasChatIntegrationLanguagesTable'
import {GorgiasChatIntegrationLanguagesTableRow} from './components/GorgiasChatIntegrationLanguagesTable/GorgiasChatIntegrationLanguagesTableRow'
import {useGorgiasChatIntegrationLanguagesTable} from './components/GorgiasChatIntegrationLanguagesTable/useGorgiasChatIntegrationLanguagesTable'

type GorgiasChatIntegrationLanguagesProps = {
    integration: Map<any, any>
    loading: Map<any, any>
}

const GorgiasChatIntegrationLanguages = ({
    integration,
    loading,
}: GorgiasChatIntegrationLanguagesProps) => {
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
        await addLanguage({language: option.value as Language})
    }

    return (
        <div className="full-width">
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
                <GorgiasChatIntegrationConnectedChannel
                    integration={integration}
                />

                <DropdownButtonWithSearch
                    label="Add Language"
                    options={languagesAvailable}
                    variant="primary"
                    withLargeMenu
                    onSelectOptionChange={onAddLanguage}
                />
            </PageHeader>

            <GorgiasChatIntegrationHeader integration={integration} />

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
