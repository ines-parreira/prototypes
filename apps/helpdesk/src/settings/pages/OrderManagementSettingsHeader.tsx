import { NavLink, useHistory } from 'react-router-dom'

import { Button, Icon } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/constants'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import StoreSelector from 'pages/common/components/StoreSelector/StoreSelector'
import { useStoreSelector } from 'settings/automate'

import css from './OrderManagementSettingsHeader.less'

const BASE_PATH = '/app/settings/order-management'

export function OrderManagementSettingsHeader() {
    const history = useHistory()
    const { integrations, onChange, selected } = useStoreSelector(BASE_PATH, [
        IntegrationType.Shopify,
    ])

    const selectedPath = selected
        ? `${BASE_PATH}/${selected.type}/${selected.name}`
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
                        Order Management
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
