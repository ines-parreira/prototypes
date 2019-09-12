// @flow

import React from 'react'
import {Alert, Breadcrumb, BreadcrumbItem, Card, Container, Progress, Table, UncontrolledTooltip} from 'reactstrap'
import {Link} from 'react-router'
import type {Map} from 'immutable'
import {connect} from 'react-redux'
import classnames from 'classnames'

import {getFacebookMaxAccountAds} from '../../../../../../state/integrations/selectors'
import FacebookIntegrationNavigation from '../FacebookIntegrationNavigation'
import PageHeader from '../../../../../common/components/PageHeader'
import ToggleButton from '../../../../../common/components/ToggleButton'
import {
    getFacebookIntegrationInternals,
    getFacebookIntegrationLoading,
    getFacebookIntegrationLoadingAds
} from '../../../../../../state/facebookAds/selectors'
import type {dispatchType} from '../../../../../../state/types'

import Loader from '../../../../../common/components/Loader/Loader'

import {DatetimeLabel} from '../../../../../common/utils/labels'

import {getTimezone} from '../../../../../../state/currentUser/selectors'

import {fetchAds, updateAd} from './actions'
import css from './FacebookIntegrationAds.less'
import colors from './colors.less'


type Props = {
    loading: boolean,
    integrations: Map<*, *>,
    integration: Map<*, *>,
    maxAccountAds: number,
    internals: Map<*, *>,
    loadingAds: Map<*, *>,
    timezone: string,
    fetchAds: () => void,
    updateAd: (adId: string, isActive: boolean) => void
}

class FacebookIntegrationAds extends React.Component<Props> {
    componentWillMount() {
        const {fetchAds} = this.props
        fetchAds()
    }

    render() {
        const {
            loading, integration, integrations, internals, maxAccountAds, loadingAds, timezone, updateAd
        } = this.props

        const accountTotalAds = this._getAccountTotalAds()
        const showUpgradePlan = accountTotalAds / maxAccountAds >= 0.75

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/facebook">Facebook, Messenger & Instagram</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.get('name')}
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Ads
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <FacebookIntegrationNavigation integration={integration}/>

                <Container
                    fluid
                    className="page-container"
                >
                    <div className="mb-3">
                        <p>
                            It can take up to 1 hour to synchronize new ads on Gorgias. Instagram ads comments are{' '}
                            fetched every 20 minutes. Comments sent while an ad was not active on Gorgias will not{' '}
                            be fetched. Learn more about Instagram ads comments support{' '}
                            <a
                                href="https://docs.gorgias.io/social-media-integrations/instagram-ads-comments"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                in our docs
                            </a>.
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

                {loading
                    ? (
                        <Container fluid>
                            <Loader/>
                        </Container>
                    )
                    : (
                        <AdsTable
                            ads={this._getInternal('ads')}
                            loadingAds={loadingAds}
                            maxAccountAds={maxAccountAds}
                            accountTotalAds={accountTotalAds}
                            updateAd={updateAd}
                            timezone={timezone}
                        />
                    )
                }
            </div>
        )
    }

    _getAccountTotalAds(): number {
        const {internals} = this.props

        return internals.reduce(
            (total, internal) => total + FacebookIntegrationAds.getIntegrationTotalAds(internal),
            0
        )
    }

    static getIntegrationTotalAds(internal: Map<*, *>): number {
        return internal
            .get('ads', [])
            .reduce((total, internal) => internal.get('is_active') ? total + 1 : total, 0)
    }

    _getInternal(key: string): ? Map<*, *> {
        const {integration} = this.props

        if (!integration || integration.isEmpty()) {
            return null
        }

        const {internals} = this.props
        const internal = internals.get(integration.get('id').toString())

        if (!internal || internal.isEmpty()) {
            return null
        }

        return internal.get(key).entrySeq()
    }
}

const mapStateToProps = (state: Object) => ({
    maxAccountAds: getFacebookMaxAccountAds(state),
    loading: getFacebookIntegrationLoading(state),
    internals: getFacebookIntegrationInternals(state),
    loadingAds: getFacebookIntegrationLoadingAds(state),
    timezone: getTimezone(state)
})

const mapDispatchToProps = (dispatch: dispatchType, props: Props) => ({
    fetchAds: () => dispatch(fetchAds()),
    updateAd: (id: string, isActive: boolean) =>
        dispatch(updateAd(props.integration.get('id'), id, isActive)),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FacebookIntegrationAds)

// Alerts
function UpgradePlanAlert() {
    return (
        <Alert color="success">
            <strong>Need to synchronize more ads?</strong>{' '}
            <Link
                to="/app/settings/billing"
                className="alert-link"
            >
                Upgrade your plan!
            </Link>
        </Alert>
    )
}

// AdsOverviewCard
type AdsOverviewCardProps = {
    integrations: Map<*, *>,
    maxAccountAds: number,
    internals: Map<*, *>,
    accountTotalAds: number,
}

class AdsOverviewCard extends React.Component<AdsOverviewCardProps> {
    render() {
        const {integrations, maxAccountAds, internals, accountTotalAds} = this.props

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
                        Number of active ads VS total number of ads available for your current plan.
                    </UncontrolledTooltip>
                </div>
                <Progress multi>
                    {internals.entrySeq().map(([integrationId, internal], index) =>
                        <Progress
                            key={`progress-${integrationId}`}
                            id={`progress-${integrationId}`}
                            bar
                            striped
                            value={FacebookIntegrationAds.getIntegrationTotalAds(internal)}
                            max={maxAccountAds}
                            className={colors[`color-${index % Object.keys(colors).length}`]}
                        />
                    )}
                </Progress>
                <div className={css.legendContainer}>
                    {internals.entrySeq().map(([integrationId, internal], index) => {
                        const integration = integrations
                            .find((integration) => integration.get('id') === parseInt(integrationId))

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
                                        colors[`color-${index % Object.keys(colors).length}`],
                                        'progress-bar-striped',
                                        css.legendColor
                                    )}
                                />
                                {integration.get('name')}
                                {' '}
                                ({FacebookIntegrationAds.getIntegrationTotalAds(internal)} active ads)
                            </div>
                        )
                    })}
                </div>
            </Card>
        )
    }
}

// AdsTable
type AdsTableProps = {
    ads: ? Map<*, *>,
    loadingAds: Map<*, *>,
    maxAccountAds: number,
    accountTotalAds: number,
    timezone: string,
    updateAd: (adId: string, isActive: boolean) => void,
}

class AdsTable extends React.Component<AdsTableProps> {
    render() {
        const {ads, loadingAds, accountTotalAds, maxAccountAds, timezone} = this.props

        if (!ads || !ads.size) {
            return null
        }

        const limitReached = accountTotalAds >= maxAccountAds

        return (
            <Table hover>
                <tbody>
                    {ads.map(([adId, ad]) =>
                        <tr
                            key={adId}
                            className={css.row}
                        >
                            <td>
                                <span className="mr-2">
                                    <b>{ad.get('name')}</b>
                                </span>
                                {ad.get('comments_fetched_at')
                                    ? (
                                        <span className="text-faded">
                                            Comments fetched at{' '}
                                            <DatetimeLabel
                                                dateTime={ad.get('comments_fetched_at')}
                                                labelFormat="L LT"
                                                timezone={timezone}
                                            />
                                        </span>
                                    )
                                    : null
                                }
                            </td>
                            <td className="smallest align-middle">
                                <ToggleButton
                                    value={ad.get('is_active')}
                                    onChange={ad.get('is_active')
                                        ? () => this._deactivateAd(adId)
                                        : () => this._activateAd(adId)
                                    }
                                    loading={loadingAds.includes(adId)}
                                    disabled={!ad.get('is_active') && limitReached || loadingAds.includes(adId)}
                                />
                            </td>
                        </tr>
                    )}
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
