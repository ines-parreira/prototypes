import { useMemo } from 'react'

import { Link, NavLink, useHistory, useParams } from 'react-router-dom'

import {
    Breadcrumb,
    Breadcrumbs,
    Button,
    Icon,
    PanelHeader,
    Text,
} from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/constants'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import StoreSelector from 'pages/common/components/StoreSelector/StoreSelector'
import { useStoreSelector } from 'settings/automate'

import css from './OrderManagementFlowHeader.less'

const BASE_PATH = '/app/settings/order-management'
const HELP_URL =
    'https://docs.gorgias.com/en-US/self-service-portal-statuses-81862'

type Props = {
    title: string
    backPath?: string
    onSave?: () => void
    isSaveDisabled?: boolean
    isSaveLoading?: boolean
}

export const OrderManagementFlowHeader = ({
    title,
    backPath,
    onSave,
    isSaveDisabled = true,
    isSaveLoading = false,
}: Props) => {
    const history = useHistory()
    const { shopType, shopName } = useParams<{
        shopType: string
        shopName: string
    }>()
    const { integrations, onChange, selected } = useStoreSelector(BASE_PATH, [
        IntegrationType.Shopify,
    ])

    const storePath = `${BASE_PATH}/${shopType}/${shopName}`
    const channelsPath = `${storePath}/channels`

    const isConfigurationPath = (pathname: string) =>
        pathname === storePath ||
        (pathname.startsWith(`${storePath}/`) &&
            pathname !== channelsPath &&
            !pathname.startsWith(`${channelsPath}/`))

    const breadcrumbItems = useMemo(
        () => [
            {
                id: 'order-management',
                label: 'Order Management',
                link: storePath,
            },
            { id: 'flow', label: title },
        ],
        [title, storePath],
    )

    return (
        <>
            <div className={css.pageHeader}>
                <Breadcrumbs items={breadcrumbItems}>
                    {(item) => (
                        <Breadcrumb>
                            {item.link ? (
                                <Text size="sm">
                                    <Link
                                        className={css.breadcrumbLink}
                                        to={item.link}
                                    >
                                        {item.label}
                                    </Link>
                                </Text>
                            ) : (
                                <Text size="sm" variant="medium">
                                    {item.label}
                                </Text>
                            )}
                        </Breadcrumb>
                    )}
                </Breadcrumbs>
                <PanelHeader
                    leadingSlot={
                        <Button
                            icon="arrow-left"
                            size="sm"
                            variant="secondary"
                            aria-label="Go back"
                            onClick={() => history.push(backPath ?? storePath)}
                        />
                    }
                    title={title}
                    p={0}
                    trailingSlot={
                        <>
                            <Text>
                                <a
                                    href={HELP_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={css.helpLink}
                                >
                                    Learn more about order statuses{' '}
                                    <Icon name="external-link" />
                                </a>
                            </Text>
                            <StoreSelector
                                integrations={integrations}
                                selected={selected}
                                onChange={onChange}
                            />
                            {onSave && (
                                <Button
                                    onClick={onSave}
                                    isDisabled={isSaveDisabled}
                                    isLoading={isSaveLoading}
                                >
                                    Save
                                </Button>
                            )}
                        </>
                    }
                />
            </div>
            <SecondaryNavbar>
                <NavLink
                    exact
                    to={storePath}
                    isActive={(_, location) =>
                        isConfigurationPath(location.pathname)
                    }
                >
                    Configuration
                </NavLink>
                <NavLink exact to={channelsPath}>
                    Channels
                </NavLink>
            </SecondaryNavbar>
        </>
    )
}
