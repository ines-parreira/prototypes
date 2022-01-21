import React, {useState, useMemo} from 'react'
import {Link} from 'react-router-dom'
import {Card, CardBody, CardHeader} from 'reactstrap'
import {fromJS, Map, List} from 'immutable'
import moment from 'moment'

import css from './GorgiasChatIntegrationOneClickInstallationCard.less'
import {OneClickInstallationCardStoreRow} from './OneClickInstallationCardStoreRow'

type Props = {
    integration: Map<any, any>
    updateOrCreateIntegration: (integration: Map<any, any>) => Promise<void>
    shopifyIntegrations: List<Map<any, any>>
    hasAutomationAddOn: boolean
}

export function GorgiasChatIntegrationOneClickInstallationCard({
    integration,
    updateOrCreateIntegration,
    shopifyIntegrations,
    hasAutomationAddOn,
}: Props) {
    const [loading, setLoading] = useState<{
        [key: string]: {installation?: boolean; disconnection?: boolean} | null
    }>({})
    const shopifyIntegrationIds: List<number> = integration.getIn(
        ['meta', 'shopify_integration_ids'],
        fromJS([])
    )

    const associatedShopifyStoreName = integration.getIn(['meta', 'shop_name'])
    const associatedShopifyStoreId: number = useMemo(() => {
        const associatedShopifyStore: Map<any, any> = shopifyIntegrations.find(
            (shopifyIntegration: Map<any, any> | undefined) =>
                shopifyIntegration?.get('name') === associatedShopifyStoreName
        )
        return associatedShopifyStore?.get('id') as number
    }, [shopifyIntegrations, integration])

    const filteredShopifyIntegrations = useMemo(
        () =>
            shopifyIntegrations
                .filter((shopifyIntegration: Map<any, any> | undefined) => {
                    const shopifyIntegrationId: number =
                        shopifyIntegration?.get('id')
                    const installedShopifyIntegrationIds: List<number> =
                        integration.getIn(
                            ['meta', 'shopify_integration_ids'],
                            fromJS([])
                        )

                    if (
                        installedShopifyIntegrationIds.contains(
                            shopifyIntegrationId
                        )
                    ) {
                        return true
                    } else if (
                        shopifyIntegrationId === associatedShopifyStoreId
                    ) {
                        return true
                    }

                    return false
                })
                .sortBy((shopifyIntegration: Map<any, any> | undefined) => {
                    const shopifyIntegrationId: number =
                        shopifyIntegration?.get('id')
                    if (shopifyIntegrationId === associatedShopifyStoreId) {
                        return -Infinity
                    }

                    return -moment(
                        shopifyIntegration?.get('created_datetime')
                    ).valueOf()
                }),

        [shopifyIntegrations, integration]
    )

    const onInstall = async (targetIntegrationId: number) => {
        setLoading({...loading, [targetIntegrationId]: {installation: true}})

        let targetIntegrationIdsList: List<number> = integration.getIn(
            ['meta', 'shopify_integration_ids'],
            fromJS([])
        )

        if (!targetIntegrationIdsList?.contains(targetIntegrationId)) {
            targetIntegrationIdsList =
                targetIntegrationIdsList?.push(targetIntegrationId)
        }

        const meta: Map<any, any> = integration.get('meta')
        const updatedMeta = meta.set(
            'shopify_integration_ids',
            targetIntegrationIdsList
        )
        const form = {
            id: integration.get('id'),
            type: integration.get('type'),
            meta: updatedMeta,
        }

        await updateOrCreateIntegration(fromJS(form))

        setLoading({...loading, [targetIntegrationId]: null})
    }

    const onUninstall = async (targetIntegrationId: number) => {
        setLoading({...loading, [targetIntegrationId]: {installation: true}})
        const meta: Map<any, any> = integration.get('meta')
        const indexToDelete: number = shopifyIntegrationIds.findIndex(
            (value) => value === targetIntegrationId
        )
        const updatedMeta = meta
            .set('shop_name', meta.get('shop_name', null))
            .deleteIn(['shopify_integration_ids', indexToDelete])
        const form = {
            id: integration.get('id'),
            type: integration.get('type'),
            meta: updatedMeta,
        }

        await updateOrCreateIntegration(fromJS(form))

        setLoading({...loading, [targetIntegrationId]: null})
    }

    const onDisconnect = async (targetIntegrationId: number) => {
        setLoading({...loading, [targetIntegrationId]: {disconnection: true}})
        const meta: Map<any, any> = integration.get('meta')
        const updatedMeta: Map<any, any> = meta
            .set('shop_name', null)
            .set('shop_type', null)
            .set('shop_integration_id', null)
            .set('shopify_integration_ids', [])
        const form = {
            id: integration.get('id'),
            type: integration.get('type'),
            meta: updatedMeta,
        }

        await updateOrCreateIntegration(fromJS(form))

        setLoading({...loading, [targetIntegrationId]: null})
    }

    return (
        <Card className={css['card']}>
            <CardHeader className={css['card-header']}>
                <h3>One-click installation</h3>
            </CardHeader>

            <CardBody className={css['card-body']}>
                <p>
                    Activate the customer chat widget on your Shopify store in
                    one click.
                    {hasAutomationAddOn && (
                        <span>
                            {' '}
                            Note that this will automatically enable{' '}
                            <Link to={`/app/settings/self-service`}>
                                Self-Service
                            </Link>
                            .
                        </span>
                    )}
                </p>
                {!associatedShopifyStoreId ? (
                    <OneClickInstallationCardStoreRow
                        key={integration.getIn(['meta', 'shop_integration_id'])}
                        isChatInstalled={shopifyIntegrationIds.includes(
                            integration.getIn(['meta', 'shop_integration_id'])
                        )}
                        targetIntegrationId={integration.getIn([
                            'meta',
                            'shop_integration_id',
                        ])}
                        targetIntegrationName={associatedShopifyStoreName}
                        isLegacyInstallation={false}
                        isIntegrationDeactivated={true}
                        onInstall={onInstall}
                        onUninstall={onUninstall}
                        onDisconnect={onDisconnect}
                        loading={loading}
                    />
                ) : null}
                {filteredShopifyIntegrations.map((targetIntegration) => {
                    const targetIntegrationId: number =
                        targetIntegration?.get('id')
                    const targetIntegrationName: string =
                        targetIntegration?.get('name')

                    const isChatInstalled: boolean =
                        shopifyIntegrationIds.includes(targetIntegrationId)

                    const isLegacyInstallation: boolean =
                        targetIntegrationId !== associatedShopifyStoreId

                    const hasLegacyInstallations =
                        !isLegacyInstallation &&
                        filteredShopifyIntegrations.size > 1

                    const isIntegrationDeactivated = Boolean(
                        targetIntegration?.get('deactivated_datetime')
                    )

                    return (
                        <OneClickInstallationCardStoreRow
                            key={targetIntegrationId}
                            isChatInstalled={isChatInstalled}
                            targetIntegrationId={targetIntegrationId}
                            targetIntegrationName={targetIntegrationName}
                            isLegacyInstallation={isLegacyInstallation}
                            hasLegacyInstallations={hasLegacyInstallations}
                            isIntegrationDeactivated={isIntegrationDeactivated}
                            onInstall={onInstall}
                            onUninstall={onUninstall}
                            onDisconnect={onDisconnect}
                            loading={loading}
                        />
                    )
                })}
            </CardBody>
        </Card>
    )
}

export default GorgiasChatIntegrationOneClickInstallationCard
