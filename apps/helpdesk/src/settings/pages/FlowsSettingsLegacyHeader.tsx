import { NavLink } from 'react-router-dom'

import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import Header from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import StoreSelector from 'pages/common/components/StoreSelector/StoreSelector'
import { useStoreSelector } from 'settings/automate'

import css from './FlowsSettings.less'

const BASE_PATH = '/app/settings/flows'

export const FlowsSettingsLegacyHeader = () => {
    const { integrations, onChange, selected } = useStoreSelector(BASE_PATH)

    const selectedName = selected
        ? getShopNameFromStoreIntegration(selected)
        : undefined

    const selectedPath = selected
        ? `${BASE_PATH}/${selected.type}/${selectedName}`
        : undefined

    return (
        <>
            <Header className={css.header} title="Flows">
                <StoreSelector
                    integrations={integrations}
                    selected={selected}
                    onChange={onChange}
                />
            </Header>
            {!!selected && !!selectedPath && (
                <SecondaryNavbar>
                    <NavLink exact to={`${selectedPath}`}>
                        Configuration
                    </NavLink>
                    <NavLink exact to={`${selectedPath}/channels`}>
                        Channels
                    </NavLink>
                </SecondaryNavbar>
            )}
        </>
    )
}
