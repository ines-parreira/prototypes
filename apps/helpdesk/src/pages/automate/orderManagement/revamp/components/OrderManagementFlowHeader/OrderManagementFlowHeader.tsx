import { useMemo } from 'react'

import { Link, NavLink, useHistory, useParams } from 'react-router-dom'

import {
    Breadcrumb,
    Breadcrumbs,
    Button,
    ButtonAs,
    ButtonIntent,
    ButtonSize,
    ButtonVariant,
    Heading,
    HeadingSize,
    Icon,
    IconName,
    PageHeader,
    Text,
    TextSize,
    TextVariant,
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
    onSave?: () => void
    isSaveDisabled?: boolean
}

export const OrderManagementFlowHeader = ({
    title,
    onSave,
    isSaveDisabled = true,
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
                                <Text size={TextSize.Sm}>
                                    <Link
                                        className={css.breadcrumbLink}
                                        to={item.link}
                                    >
                                        {item.label}
                                    </Link>
                                </Text>
                            ) : (
                                <Text
                                    size={TextSize.Sm}
                                    variant={TextVariant.Medium}
                                >
                                    {item.label}
                                </Text>
                            )}
                        </Breadcrumb>
                    )}
                </Breadcrumbs>
                <PageHeader
                    title={
                        <>
                            <Button
                                icon={IconName.ArrowLeft}
                                size={ButtonSize.Sm}
                                variant={ButtonVariant.Secondary}
                                intent={ButtonIntent.Regular}
                                aria-label="Go back"
                                onClick={() => history.push(storePath)}
                            />
                            <Heading size={HeadingSize.Xl}>{title}</Heading>
                        </>
                    }
                    p={0}
                >
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
                            intent={ButtonIntent.Regular}
                            variant={ButtonVariant.Primary}
                            as={ButtonAs.Button}
                            size={ButtonSize.Md}
                            onClick={onSave}
                            isDisabled={isSaveDisabled}
                        >
                            Save
                        </Button>
                    )}
                </PageHeader>
            </div>
            <SecondaryNavbar>
                <NavLink exact to={storePath}>
                    Configuration
                </NavLink>
                <NavLink exact to={`${storePath}/channels`}>
                    Channels
                </NavLink>
            </SecondaryNavbar>
        </>
    )
}
