import React, {useEffect, useState} from 'react'
import {useLocalStorage} from 'react-use'
import {Link} from 'react-router-dom'

import {fetchInstalledApps} from 'models/integration/resources'
import {AppListItem} from 'models/integration/types/app'
import {fetchIntegrations} from 'state/integrations/actions'
import {IntegrationListItem} from 'state/integrations/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getIntegrationsList} from 'state/integrations/selectors'
import useTitle from 'hooks/useTitle'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import PageHeader from 'pages/common/components/PageHeader'
import Alert from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import logoShopify from 'assets/img/integrations/shopify.svg'
import logoYotpo from 'assets/img/integrations/yotpo.png'
import logoRecharge from 'assets/img/integrations/recharge.svg'

import CardsWrapper from '../CardsWrapper'
import Card from '../Card'
import Loader from '../Loader'
import css from './Mine.less'

type Item = IntegrationListItem | AppListItem

export const LOCAL_STORAGE_KEY = `integrations_connected_warning_discarded`

export default function Mine() {
    useTitle('My Apps')
    const dispatch = useAppDispatch()

    const installedIntegrations = useAppSelector(getIntegrationsList).filter(
        (integration) => {
            return integration.count > 0
        }
    )
    const [isAlertDiscarded, setAlertDiscarded] = useLocalStorage(
        LOCAL_STORAGE_KEY,
        false
    )

    const [isLoading, setLoading] = useState(true)
    const [connectedApps, setConnectedApps] = useState<AppListItem[]>([])

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetchInstalledApps()
                setConnectedApps(res)
            } catch {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: `Something went wrong while trying to fetch additional apps.`,
                    })
                )
            } finally {
                setLoading(false)
            }
        }
        void fetchData()
    }, [dispatch])

    useEffect(() => {
        void dispatch(fetchIntegrations())
    }, [dispatch])

    const connectedItems: Item[] = [...installedIntegrations, ...connectedApps]

    return (
        <main className="full-width">
            <PageHeader title="My Apps" />
            <div className={css.container}>
                {!isAlertDiscarded && (
                    <Alert
                        className={css.alert}
                        icon
                        onClose={() => setAlertDiscarded(true)}
                    >
                        Please note that apps manually connected outside Gorgias
                        will not appear on this list.
                    </Alert>
                )}
                <CardsWrapper>
                    {connectedItems.map((item) => (
                        <Card key={item.title} item={item} />
                    ))}
                </CardsWrapper>
                {!isLoading && !connectedItems.length && (
                    <div className={css.noApps}>
                        <div className={css.magicBox}>
                            <img
                                src={logoRecharge}
                                alt="Recharge logo"
                                className={css.left}
                            />
                            <img
                                src={logoShopify}
                                alt="Shopify logo"
                                className={css.center}
                            />
                            <img
                                src={logoYotpo}
                                alt="Yotpo logo"
                                className={css.right}
                            />
                        </div>
                        <h2>You don’t have any apps installed</h2>
                        <p>
                            Discover 100+ powerful apps and integrations to
                            maximize your helpdesk and empower your customer
                            service.
                        </p>
                        <Link to="/app/settings/integrations">
                            <Button>Explore App Store</Button>
                        </Link>
                    </div>
                )}
                {isLoading && <Loader empty={!installedIntegrations.length} />}
            </div>
        </main>
    )
}
