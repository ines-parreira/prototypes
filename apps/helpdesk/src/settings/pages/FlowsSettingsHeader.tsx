import { NavLink, useHistory } from 'react-router-dom'

import { Button, Icon } from '@gorgias/axiom'

import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import StoreSelector from 'pages/common/components/StoreSelector/StoreSelector'
import { useStoreSelector } from 'settings/automate'

import css from './FlowsSettingsHeader.less'

const BASE_PATH = '/app/settings/flows'

export const FlowsSettingsHeader = () => {
    const history = useHistory()
    const { integrations, onChange, selected } = useStoreSelector(BASE_PATH)

    const selectedName = selected
        ? getShopNameFromStoreIntegration(selected)
        : undefined

    const selectedPath = selected
        ? `${BASE_PATH}/${selected.type}/${selectedName}`
        : undefined

    return (
        <>
            <PageHeader
                title={
                    <div className={css.titleWrapper}>
                        <Button
                            variant="secondary"
                            onClick={() => history.goBack()}
                        >
                            <Icon name="arrow-left" />
                        </Button>
                        Flows
                    </div>
                }
            >
                <StoreSelector
                    integrations={integrations}
                    selected={selected}
                    onChange={onChange}
                />
            </PageHeader>
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
