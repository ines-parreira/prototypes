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
}

export function GorgiasChatIntegrationOneClickInstallationCard({
    integration,
    updateOrCreateIntegration,
    shopifyIntegrations,
}: Props) {
    const [loading, setLoading] = useState<{[key: string]: boolean}>({})
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
                    const shopifyIntegrationId: number = shopifyIntegration?.get(
                        'id'
                    )
                    const installedShopifyIntegrationIds: List<number> = integration.getIn(
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
                    const shopifyIntegrationId: number = shopifyIntegration?.get(
                        'id'
                    )
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
        setLoading({...loading, [targetIntegrationId]: true})

        let targetIntegrationIdsList: List<number> = integration.getIn(
            ['meta', 'shopify_integration_ids'],
            fromJS([])
        )

        if (!targetIntegrationIdsList?.contains(targetIntegrationId)) {
            targetIntegrationIdsList = targetIntegrationIdsList?.push(
                targetIntegrationId
            )
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

        setLoading({...loading, [targetIntegrationId]: false})
    }

    const onUninstallAndOrRemove = async (
        targetIntegrationId: number,
        withUninstall: boolean,
        withRemove: boolean
    ) => {
        setLoading({...loading, [targetIntegrationId]: true})

        const meta: Map<any, any> = integration.get('meta')
        let updatedMeta: Map<any, any> = meta.set(
            'shop_name',
            meta.get('shop_name')
        )

        if (withUninstall) {
            const indexToDelete: number = shopifyIntegrationIds.findIndex(
                (value) => value === targetIntegrationId
            )
            updatedMeta = updatedMeta.deleteIn([
                'shopify_integration_ids',
                indexToDelete,
            ])
        }

        if (
            withUninstall &&
            withRemove &&
            targetIntegrationId === meta.get('shop_integration_id')
        ) {
            // when disconnecting the store this integration was originally connected to
            // uninstall it from all other possibly remaining stores
            updatedMeta = updatedMeta.set('shopify_integration_ids', [])
        }

        if (withRemove) {
            updatedMeta = updatedMeta.set('shop_name', null)
            updatedMeta = updatedMeta.set('shop_type', null)
            updatedMeta = updatedMeta.set('shop_integration_id', null)
        }

        const form = {
            id: integration.get('id'),
            type: integration.get('type'),
            meta: updatedMeta,
        }

        await updateOrCreateIntegration(fromJS(form))

        setLoading({...loading, [targetIntegrationId]: false})
    }

    return (
        <Card className={css['card']}>
            <CardHeader className={css['card-header']}>
                <h3>One-click installation</h3>
            </CardHeader>

            <CardBody className={css['card-body']}>
                <p>
                    Activate the customer chat widget on your Shopify store in
                    one click. Note that this will <br></br> automatically
                    enable{' '}
                    <Link to={`/app/settings/self-service`}>Self-Service</Link>.
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
                        onUninstallAndOrRemove={onUninstallAndOrRemove}
                        loading={loading}
                    />
                ) : null}
                {filteredShopifyIntegrations.map((targetIntegration) => {
                    const targetIntegrationId: number = targetIntegration?.get(
                        'id'
                    )
                    const targetIntegrationName: string = targetIntegration?.get(
                        'name'
                    )

                    const isChatInstalled: boolean = shopifyIntegrationIds.includes(
                        targetIntegrationId
                    )

                    const isLegacyInstallation: boolean =
                        targetIntegrationId !== associatedShopifyStoreId

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
                            isIntegrationDeactivated={isIntegrationDeactivated}
                            onInstall={onInstall}
                            onUninstallAndOrRemove={onUninstallAndOrRemove}
                            loading={loading}
                        />
                    )
                })}
            </CardBody>
        </Card>
    )
}

export default GorgiasChatIntegrationOneClickInstallationCard
