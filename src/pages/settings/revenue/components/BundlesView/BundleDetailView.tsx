import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import React, {useCallback, useEffect, useMemo, useState} from 'react'

import {Link, useHistory, useParams} from 'react-router-dom'

import _head from 'lodash/head'

import {fromJS} from 'immutable'
import css from 'pages/settings/settings.less'

import PageHeader from 'pages/common/components/PageHeader'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RevenueBundle} from 'models/revenueBundles/types'
import * as integrationsSelectors from 'state/integrations/selectors'
import {ALLOWED_INTEGRATION_TYPES} from 'pages/settings/revenue/components/BundlesView/constants'
import ConvertBundleDetail from 'pages/convert/bundles/components/ConvertBundleDetail'
import {GORGIAS_CHAT_INTEGRATION_TYPE} from 'constants/integration'
import {Bundle} from 'models/convert/bundle/types'
import Loader from '../../../../common/components/Loader/Loader'
import {useRevenueAddonApi} from '../../hooks/useRevenueAddonApi'

export const BundleDetailView = () => {
    const dispatch = useAppDispatch()
    const history = useHistory()

    const {bundleId} = useParams<{bundleId: string}>()

    const storeIntegrations = useAppSelector(
        integrationsSelectors.getIntegrationsByTypes(ALLOWED_INTEGRATION_TYPES)
    )

    const {client: revenueClient} = useRevenueAddonApi()

    const [bundle, setBundle] = useState<RevenueBundle>()

    const [loading, setLoading] = useState(true)

    const fetchBundle = () => {
        if (revenueClient) {
            revenueClient
                .get_bundle_installation({
                    id: bundleId,
                })
                .then((response) => {
                    setBundle(response.data as RevenueBundle)
                    setLoading(false)
                })
                .catch(() => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: 'Could not get bundle information',
                        })
                    )
                })
        }
    }

    useEffect(fetchBundle, [bundleId, dispatch, revenueClient])

    const currentIntegration = useMemo(
        () =>
            _head(
                storeIntegrations.filter(
                    (integration) =>
                        bundle && integration.id === bundle.shop_integration_id
                )
            ),
        [bundle, storeIntegrations]
    )

    const storeIntegration = useMemo(
        () =>
            !!currentIntegration &&
            currentIntegration.type !== GORGIAS_CHAT_INTEGRATION_TYPE &&
            currentIntegration,
        [currentIntegration]
    )

    const chatIntegration = useMemo(
        () =>
            !!currentIntegration &&
            currentIntegration.type === GORGIAS_CHAT_INTEGRATION_TYPE &&
            currentIntegration,
        [currentIntegration]
    )

    const handleChange = useCallback(
        (isInstalled) => {
            if (!isInstalled) {
                history.push('/app/settings/convert/installations')
            }
        },
        [history]
    )

    return loading ? (
        <Loader message="Loading..." minHeight={'400px'} />
    ) : (
        <div className="w-100">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to={`/app/settings/convert/installations`}>
                                Convert installations
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {currentIntegration && currentIntegration.name}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            ></PageHeader>

            <Container fluid className={css.pageContainer}>
                <ConvertBundleDetail
                    storeIntegration={fromJS(storeIntegration)}
                    chatIntegration={fromJS(chatIntegration)}
                    bundle={bundle as Bundle}
                    onChange={handleChange}
                />
            </Container>
        </div>
    )
}
