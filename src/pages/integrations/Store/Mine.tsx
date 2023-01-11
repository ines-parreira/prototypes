import React, {useEffect, useState} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {useLocalStorage} from 'react-use'
import {Link} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {fetchApps} from 'models/integration/resources'
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

import CardsWrapper from './CardsWrapper'
import Card from './Card'
import Loader from './Loader'
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
                const res = await fetchApps()
                setConnectedApps(res.filter((app) => app.isConnected))
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

    const isAppStoreEnabled = useFlags()[FeatureFlagKey.AppStore]
    if (!isAppStoreEnabled) {
        return null
    }

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
                        Please note, that apps that you manually connected
                        outside of Gorgias will not appear on this list.
                    </Alert>
                )}
                <CardsWrapper>
                    {connectedItems.map((item) => (
                        <Card key={item.title} item={item} />
                    ))}
                </CardsWrapper>
                {!isLoading && connectedItems.length === 0 && (
                    <p className={css.noApps}>
                        You have no app connected yet. You might want to take a
                        look at{' '}
                        <Link to="/app/settings/integrations">
                            all the available apps
                        </Link>
                        ?
                    </p>
                )}
                {isLoading && <Loader />}
            </div>
        </main>
    )
}
