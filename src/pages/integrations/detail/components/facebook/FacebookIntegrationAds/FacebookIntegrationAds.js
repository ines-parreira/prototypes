// @flow

import React from 'react'
import {
    Alert,
    Breadcrumb,
    BreadcrumbItem,
    Card,
    CardBody,
    Col,
    Container,
    Progress,
    UncontrolledTooltip
} from 'reactstrap'
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
    getFacebookIntegrationLoadingAdAccounts,
    getFacebookIntegrationLoadingAds
} from '../../../../../../state/facebookAds/selectors'
import type {dispatchType} from '../../../../../../state/types'

import Loader from '../../../../../common/components/Loader/Loader'

import {DatetimeLabel} from '../../../../../common/utils/labels'

import {getTimezone} from '../../../../../../state/currentUser/selectors'

import {fetchAds, updateAd, updateAdAccount} from './actions'
import css from './FacebookIntegrationAds.less'
import colors from './colors.less'


type Props = {
    loading: boolean,
    integrations: Map<*, *>,
    integration: Map<*, *>,
    maxAccountAds: number,
    internals: Map<*, *>,
    loadingAds: Map<*, *>,
    loadingAdAccounts: Map<*, *>,
    timezone: string,
    fetchAds: () => void,
    updateAdAccount: (adAccountId: string, isActive: boolean) => void,
    updateAd: (adId: string, isActive: boolean) => void
}

class FacebookIntegrationAds extends React.Component<Props> {
    componentWillMount() {
        const {fetchAds} = this.props
        fetchAds()
    }

    render() {
        const {
            loading, integration, integrations, internals, maxAccountAds, loadingAdAccounts, loadingAds, timezone,
            updateAdAccount, updateAd
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
                    <Col
                        lg={10}
                        xl={8}
                    >
                        {loading
                            ? <Loader/>
                            : (
                                <div>
                                    {showUpgradePlan && <UpgradePlanAlert/>}
                                    <AdsOverviewCard
                                        integrations={integrations}
                                        internals={internals}
                                        maxAccountAds={maxAccountAds}
                                        accountTotalAds={accountTotalAds}
                                    />
                                    <AdAccountsCard
                                        accounts={this._getInternal('ad_accounts')}
                                        loadingAdAccounts={loadingAdAccounts}
                                        updateAdAccount={updateAdAccount}
                                    />
                                    <AdsCard
                                        ads={this._getInternal('ads')}
                                        loadingAds={loadingAds}
                                        maxAccountAds={maxAccountAds}
                                        accountTotalAds={accountTotalAds}
                                        updateAd={updateAd}
                                        timezone={timezone}
                                    />
                                </div>
                            )
                        }
                    </Col>
                </Container>
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
    loadingAdAccounts: getFacebookIntegrationLoadingAdAccounts(state),
    timezone: getTimezone(state)
})

const mapDispatchToProps = (dispatch: dispatchType, props: Props) => ({
    fetchAds: () => dispatch(fetchAds()),
    updateAdAccount: (id: string, isActive: boolean) =>
        dispatch(updateAdAccount(props.integration.get('id'), id, isActive)),
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
        <Alert
            color="success"
            className={css.card}
        >
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
            <Card className={css.card}>
                <CardBody>
                    <h3>Active ads per integration</h3>
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
                </CardBody>
            </Card>
        )
    }
}

// AdAccountsCard
type AdAccountsCardProps = {
    accounts: ? Map<*, *>,
    loadingAdAccounts: Map<*, *>,
    updateAdAccount: (adAccountId: string, isActive: boolean) => void,
}

class AdAccountsCard extends React.Component<AdAccountsCardProps> {
    render() {
        const {accounts, loadingAdAccounts} = this.props

        if (!accounts || !accounts.size) {
            return null
        }

        return (
            <Card className={css.card}>
                <CardBody>
                    <h3>Ad accounts</h3>
                    {accounts.map(([accountId, account]) => (
                        <div
                            key={accountId}
                            className={css.list}
                        >
                            <div className={css.name}><b>{account.get('name')}</b></div>
                            <ToggleButton
                                value={account.get('is_active')}
                                onChange={account.get('is_active')
                                    ? () => this._deactivateAdAccount(accountId)
                                    : () => this._activateAdAccount(accountId)
                                }
                                loading={loadingAdAccounts.includes(accountId)}
                                disabled={loadingAdAccounts.includes(accountId)}
                            />
                        </div>
                    ))}
                </CardBody>
            </Card>
        )
    }

    _deactivateAdAccount(accountId: string) {
        const {updateAdAccount} = this.props
        updateAdAccount(accountId, false)
    }

    _activateAdAccount(accountId: string) {
        const {updateAdAccount} = this.props
        updateAdAccount(accountId, true)
    }
}


// AdAccountsCard
type AdsCardProps = {
    ads: ? Map<*, *>,
    loadingAds: Map<*, *>,
    maxAccountAds: number,
    accountTotalAds: number,
    timezone: string,
    updateAd: (adId: string, isActive: boolean) => void,
}

class AdsCard extends React.Component<AdsCardProps> {
    render() {
        const {ads, loadingAds, accountTotalAds, maxAccountAds, timezone} = this.props

        if (!ads || !ads.size) {
            return null
        }

        const limitReached = accountTotalAds >= maxAccountAds

        return (
            <Card className={css.card}>
                <CardBody>
                    <h3>Ads</h3>
                    {ads.map(([adId, ad]) =>
                        <div
                            key={adId}
                            className={css.list}
                        >
                            <div className={css.name}>
                                <b>
                                    {ad.get('name')}
                                    {' '}
                                    {ad.get('comments_fetched_at')
                                        ? (
                                            <span className="text-muted">
                                                (comments fetched at{' '}
                                                <DatetimeLabel
                                                    dateTime={ad.get('comments_fetched_at')}
                                                    labelFormat="L LT"
                                                    timezone={timezone}
                                                />
                                            </span>
                                        )
                                        : null
                                    }
                                </b>
                            </div>
                            <ToggleButton
                                value={ad.get('is_active')}
                                onChange={ad.get('is_active')
                                    ? () => this._deactivateAd(adId)
                                    : () => this._activateAd(adId)
                                }
                                loading={loadingAds.includes(adId)}
                                disabled={!ad.get('is_active') && limitReached || loadingAds.includes(adId)}
                            />
                        </div>
                    )}
                </CardBody>
            </Card>
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
