import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import React, {useEffect, useState} from 'react'

import {Link} from 'react-router-dom'
import _head from 'lodash/head'
import Button from 'pages/common/components/button/Button'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import css from 'pages/settings/settings.less'

import PageHeader from 'pages/common/components/PageHeader'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import useAppDispatch from 'hooks/useAppDispatch'
import * as integrationsSelectors from 'state/integrations/selectors'
import {RevenueBundle, RevenueBundleStatus} from 'models/revenueBundles/types'

import ForwardIcon from 'pages/integrations/common/components/ForwardIcon'
import NoIntegration from 'pages/integrations/integration/components/NoIntegration'
import history from 'pages/history'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/constants'
import {getIconFromType} from 'state/integrations/helpers'
import {useIsRevenueBetaTester} from 'pages/common/hooks/useIsRevenueBetaTester'
import {useRevenueAddonApi} from '../../hooks/useRevenueAddonApi'
import pageCss from './BundlesView.less'

export const BundlesView = () => {
    const {client} = useRevenueAddonApi()
    const dispatch = useAppDispatch()

    const storeIntegrations = useAppSelector(
        integrationsSelectors.getIntegrationsByTypes([IntegrationType.Shopify])
    )

    const [bundleList, setBundleList] = useState<RevenueBundle[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function init() {
            if (client) {
                try {
                    const response = await client.list_bundle_installation()
                    setBundleList(response.data as RevenueBundle[])
                } catch (error) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: 'Could not get current bundles',
                        })
                    )
                }

                setLoading(false)
            }
        }

        void init()
    }, [client, dispatch])

    const goToBundleInstall = () =>
        history.push('/app/settings/revenue/bundles/new')

    const goToBundle = (id: string) =>
        history.push(`/app/settings/revenue/bundles/${id}`)

    const stopPropagation = (ev: React.MouseEvent) => {
        ev.stopPropagation()
    }

    const getStore = (integration_id: number) =>
        _head(
            storeIntegrations.filter(
                (integration) => integration.id === integration_id
            )
        )

    const isRevenueSubscriber = useIsRevenueBetaTester()
    if (!isRevenueSubscriber) {
        return (
            <div className={css.pageContainer}>
                You don't have access to this page, please contact your CSM.
            </div>
        )
    }

    return (
        <div className="w-100">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem active>
                            Bundle management
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                <Button onClick={goToBundleInstall}>Install</Button>
            </PageHeader>

            {bundleList.length === 0 && (
                <div className={css.pageContainer}>
                    <NoIntegration loading={loading} />
                </div>
            )}

            {bundleList.length > 0 && (
                <TableWrapper className={css.table}>
                    <TableHead className={css.header}>
                        <HeaderCellProperty title="Store" />
                        <HeaderCellProperty title="Status" />
                        <HeaderCell />
                    </TableHead>
                    <TableBody>
                        {bundleList.map((bundle) => {
                            const store = getStore(bundle.shop_integration_id)
                            return (
                                <TableBodyRow
                                    onClick={() => goToBundle(bundle.id)}
                                    key={bundle.id}
                                >
                                    <BodyCell innerClassName={css.chatName}>
                                        {!!store ? (
                                            <>
                                                <img
                                                    className={
                                                        pageCss.storeIcon
                                                    }
                                                    alt="logo"
                                                    src={getIconFromType(
                                                        store.type
                                                    )}
                                                />
                                                <b>{store.name}</b>
                                            </>
                                        ) : (
                                            <>---</>
                                        )}
                                    </BodyCell>
                                    <BodyCell size="small">
                                        {bundle.status}
                                    </BodyCell>
                                    <BodyCell
                                        size="smallest"
                                        innerClassName={css.lastColumn}
                                    >
                                        {bundle.status !==
                                        RevenueBundleStatus.Installed ? (
                                            <Link
                                                to={`/app/settings/revenue/bundles/${bundle.id}`}
                                                onClick={stopPropagation}
                                            >
                                                Continue Setup
                                            </Link>
                                        ) : (
                                            <ForwardIcon
                                                href={`/app/settings/revenue/bundles/${bundle.id}`}
                                                onClick={stopPropagation}
                                            />
                                        )}
                                    </BodyCell>
                                </TableBodyRow>
                            )
                        })}
                    </TableBody>
                </TableWrapper>
            )}
        </div>
    )
}
