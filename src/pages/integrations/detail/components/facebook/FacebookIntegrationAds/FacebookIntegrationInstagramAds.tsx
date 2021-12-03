import React, {Component} from 'react'
import {
    Alert,
    Breadcrumb,
    BreadcrumbItem,
    Card,
    Container,
    Progress,
    Table,
    UncontrolledTooltip,
} from 'reactstrap'
import {Link} from 'react-router-dom'
import {Map, List} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'

import {getFacebookMaxAccountAds} from '../../../../../../state/integrations/selectors'
import FacebookIntegrationNavigation from '../FacebookIntegrationNavigation'
import PageHeader from '../../../../../common/components/PageHeader'
import ToggleButton from '../../../../../common/components/ToggleButton'
import {
    getFacebookIntegrationInternals,
    getFacebookIntegrationLoading,
    getFacebookIntegrationLoadingAds,
} from '../../../../../../state/facebookAds/selectors'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import Loader from '../../../../../common/components/Loader/Loader'
import {DatetimeLabel} from '../../../../../common/utils/labels'
import settingsCss from '../../../../../settings/settings.less'

import {fetchAds, updateAd} from './actions'
import css from './FacebookIntegrationInstagramAds.less'
import colors from './colors.less'

type OwnProps = {
    integration: Map<any, any>
    integrations: List<any>
}

type Props = OwnProps & ConnectedProps<typeof connector>

class FacebookIntegrationInstagramAds extends Component<Props> {
    componentWillMount() {
        const {fetchAds} = this.props
        void fetchAds()
    }

    render() {
        const {
            loading,
            integration,
            integrations,
            internals,
            maxAccountAds,
            loadingAds,
            updateAd,
        } = this.props

        const accountTotalAds = this._getAccountTotalAds()
        const showUpgradePlan = accountTotalAds / maxAccountAds >= 0.75

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    Integrations
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations/facebook">
                                    Facebook, Messenger & Instagram
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <FacebookIntegrationNavigation integration={integration} />

                <Container fluid className={settingsCss.pageContainer}>
                    <div className="mb-3">
                        <p>
                            It can take up to 2 hours to synchronize new
                            Instagram ads on Gorgias. Instagram ads comments are
                            fetched every 20 minutes. Comments sent while an
                            Instagram ad was not active on Gorgias will not be
                            fetched. Learn more about{' '}
                            <a
                                href="https://docs.gorgias.com/social-media-integrations/instagram-ads-comments"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                Instagram ads comments support
                            </a>{' '}
                            in our docs.
                        </p>

                        {showUpgradePlan && (
                            <AdsOverviewCard
                                integrations={integrations}
                                internals={internals}
                                maxAccountAds={maxAccountAds}
                                accountTotalAds={accountTotalAds}
                            />
                        )}
                    </div>
                </Container>

                {loading ? (
                    <Container
                        fluid
                        className={classnames(settingsCss.pageContainer)}
                    >
                        <Loader />
                    </Container>
                ) : (
                    <AdsTable
                        ads={this._getInternal('ads')}
                        loadingAds={loadingAds}
                        maxAccountAds={maxAccountAds}
                        accountTotalAds={accountTotalAds}
                        updateAd={updateAd}
                    />
                )}
            </div>
        )
    }

    _getAccountTotalAds(): number {
        const {internals} = this.props

        return internals.reduce(
            (total, internal) =>
                total! +
                FacebookIntegrationInstagramAds.getIntegrationTotalAds(
                    internal
                ),
            0
        )
    }

    static getIntegrationTotalAds(internal: Map<any, any>): number {
        return (internal.get('ads', []) as List<Map<any, any>>).reduce(
            (total, internal) =>
                internal!.get('is_active') ? total! + 1 : total!,
            0
        )
    }

    _getInternal(key: string): List<any> | null {
        const {integration} = this.props

        if (!integration || integration.isEmpty()) {
            return null
        }

        const {internals} = this.props
        const internal: Map<any, any> | undefined = internals.get(
            (integration.get('id') as number).toString()
        )

        if (!internal || internal.isEmpty()) {
            return null
        }

        return (
            internal.get(key) as Map<any, any>
        ).entrySeq() as unknown as List<any>
    }
}

const connector = connect(
    (state: RootState) => ({
        maxAccountAds: getFacebookMaxAccountAds(state),
        loading: getFacebookIntegrationLoading(state),
        internals: getFacebookIntegrationInternals(state),
        loadingAds: getFacebookIntegrationLoadingAds(state),
    }),
    (dispatch: StoreDispatch, props: OwnProps) => ({
        fetchAds: () => dispatch(fetchAds()),
        updateAd: (id: string, isActive: boolean) =>
            dispatch(updateAd(props.integration.get('id'), id, isActive)),
    })
)

export default connector(FacebookIntegrationInstagramAds)

// Alerts
function UpgradePlanAlert() {
    return (
        <Alert color="success">
            <strong>Need to synchronize more ads?</strong>{' '}
            <Link to="/app/settings/billing" className="alert-link">
                Upgrade your plan!
            </Link>
        </Alert>
    )
}

// AdsOverviewCard
type AdsOverviewCardProps = {
    integrations: List<any>
    maxAccountAds: number
    internals: Map<any, any>
    accountTotalAds: number
}

class AdsOverviewCard extends Component<AdsOverviewCardProps> {
    render() {
        const {integrations, maxAccountAds, internals, accountTotalAds} =
            this.props

        return (
            <Card body>
                <h3>Active ads per integration</h3>
                <UpgradePlanAlert />
                <div className="text-center">
                    {`${accountTotalAds}/${maxAccountAds} ads `}
                    <a id="active-ads-tooltip">
                        <i className="material-icons text-muted">
                            info_outline
                        </i>
                    </a>
                    <UncontrolledTooltip target="active-ads-tooltip">
                        Number of active ads VS total number of ads available
                        for your current plan.
                    </UncontrolledTooltip>
                </div>
                <Progress multi>
                    {(internals.entrySeq() as unknown as List<any>).map(
                        (
                            [integrationId, internal]: [string, Map<any, any>],
                            index
                        ) => (
                            <Progress
                                key={`progress-${integrationId}`}
                                id={`progress-${integrationId}`}
                                bar
                                striped
                                value={FacebookIntegrationInstagramAds.getIntegrationTotalAds(
                                    internal
                                )}
                                max={maxAccountAds}
                                className={
                                    colors[
                                        `color-${
                                            index! % Object.keys(colors).length
                                        }`
                                    ]
                                }
                            />
                        )
                    )}
                </Progress>
                <div className={css.legendContainer}>
                    {(internals.entrySeq() as unknown as List<any>).map(
                        (
                            [integrationId, internal]: [string, Map<any, any>],
                            index
                        ) => {
                            const integration = integrations.find(
                                (integration) =>
                                    (integration as Map<any, any>).get('id') ===
                                    parseInt(integrationId)
                            )

                            if (!integration) {
                                return null
                            }

                            return (
                                <div
                                    key={`legend-${integrationId}`}
                                    className={css.legend}
                                >
                                    <div
                                        className={classnames(
                                            colors[
                                                `color-${
                                                    index! %
                                                    Object.keys(colors).length
                                                }`
                                            ],
                                            'progress-bar-striped',
                                            css.legendColor
                                        )}
                                    />
                                    {(integration as Map<any, any>).get('name')}{' '}
                                    (
                                    {FacebookIntegrationInstagramAds.getIntegrationTotalAds(
                                        internal
                                    )}{' '}
                                    active ads)
                                </div>
                            )
                        }
                    )}
                </div>
            </Card>
        )
    }
}

// AdsTable
type AdsTableProps = {
    ads: List<any> | null
    loadingAds: List<any>
    maxAccountAds: number
    accountTotalAds: number
    updateAd: (adId: string, isActive: boolean) => void
}

class AdsTable extends Component<AdsTableProps> {
    render() {
        const {ads, loadingAds, accountTotalAds, maxAccountAds} = this.props

        if (!ads || !ads.size) {
            return null
        }

        const limitReached = accountTotalAds >= maxAccountAds

        // Sort ads by created datetime
        const sortedAds = ads
            .map(([adId, ad]: [string, Map<any, any>]) => ad.set('id', adId))
            .sort((a, b) => {
                const aCreatedAt = new Date(a.get('created_datetime'))
                const bCreatedAt = new Date(b.get('created_datetime'))

                return +bCreatedAt - +aCreatedAt
            }) as List<any>

        return (
            <Table hover>
                <thead>
                    <tr className={css.row}>
                        <th />
                        <th>Name</th>
                        <th>Creation date</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedAds.map((ad: Map<any, any>) => (
                        <tr key={ad.get('id')} className={css.row}>
                            <td className="smallest align-middle">
                                <ToggleButton
                                    value={ad.get('is_active')}
                                    onChange={
                                        ad.get('is_active')
                                            ? () =>
                                                  this._deactivateAd(
                                                      ad.get('id')
                                                  )
                                            : () =>
                                                  this._activateAd(ad.get('id'))
                                    }
                                    loading={loadingAds.includes(ad.get('id'))}
                                    disabled={
                                        (!ad.get('is_active') &&
                                            limitReached) ||
                                        loadingAds.includes(ad.get('id'))
                                    }
                                />
                            </td>
                            <td>
                                <a
                                    href={ad.get('permalink')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {ad.get('name')}
                                </a>
                            </td>
                            <td>
                                {ad.get('created_datetime') && (
                                    <DatetimeLabel
                                        dateTime={ad.get('created_datetime')}
                                    />
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        )
    }

    _deactivateAd(adId: string) {
        const {updateAd} = this.props
        updateAd(adId, false)
    }

    _activateAd(adId: string) {
        const {updateAd} = this.props
        updateAd(adId, true)
    }
}
