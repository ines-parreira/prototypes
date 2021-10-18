import React, {Component, ComponentType} from 'react'
import {fromJS, Map} from 'immutable'
import {Button} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import axios, {AxiosError, Canceler} from 'axios'
import classnames from 'classnames'

import * as tagsSelectors from '../../../../../state/tags/selectors'
import * as segmentTracker from '../../../../../store/middlewares/segmentTracker.js'
import {SegmentEvent} from '../../../../../store/middlewares/types/segmentTracker'
import {
    TICKETS_PER_TAG,
    stats as statsConfig,
    StatConfig,
} from '../../../../../config/stats'
import Tooltip from '../../../../common/components/Tooltip'
import Loader from '../../../../common/components/Loader/Loader'
import {getStatDataByName} from '../../../../../state/entities/stats/selectors'
import {notify} from '../../../../../state/notifications/actions'
import {RootState} from '../../../../../state/types'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {saveFileAsDownloaded} from '../../../../../utils/file'
import StatsHelpIcon from '../StatsHelpIcon'
import {DEPRECATED_makeStatsFiltersSelector} from '../../../../../state/stats/selectors'
import {TwoDimensionalChart} from '../../../../../models/stat/types'
import {downloadStat} from '../../../../../models/stat/resources'
import {getFetchingStatusByName} from '../../../../../state/ui/stats/selectors'
import {getCurrentUser} from '../../../../../state/currentUser/selectors'
import {getCurrentAccountState} from '../../../../../state/currentAccount/selectors'

import LineStat from './LineStat'
import TableStat from './TableStat/TableStat'
import PerHourPerWeekTableStat from './PerHourPerWeekTableStat/PerHourPerWeekTableStat'
import KeyMetricStat from './KeyMetricStat/KeyMetricStat'
import BarStat from './BarStat'
import SankeyStat from './SankeyStat'

import css from './DEPRECATED_Stat.less'

type OwnProps = {
    defaultLoaderHeight?: string
    name: string
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    isDownloading: boolean
}

export class StatContainer extends Component<Props, State> {
    static defaultProps = {
        downloadable: false,
        isLoading: false,
        defaultLoaderHeight: '400px',
    }

    cancelDownloadStat?: Canceler
    state = {
        isDownloading: false,
    }

    componentWillUnmount() {
        if (this.cancelDownloadStat) {
            this.cancelDownloadStat()
        }
    }

    _downloadStatistic = async () => {
        const {name, filters, currentUser, account, notify} = this.props
        this.setState({isDownloading: true})
        segmentTracker.logEvent(SegmentEvent.StatDownloadClicked, {
            name,
            user_id: currentUser.get('id'),
            account_domain: account.get('domain'),
        })
        try {
            const cancelToken = axios.CancelToken.source()
            this.cancelDownloadStat = cancelToken.cancel
            const file = await downloadStat(
                name,
                {filters: filters!.toJS()},
                {cancelToken: cancelToken.token}
            )
            saveFileAsDownloaded(file.name, file.data, file.contentType)
        } catch (error) {
            if (axios.isCancel(error)) {
                return
            }

            const defaultError =
                'Failed to download statistic. Please retry in a few seconds.'
            const serverError = (error as AxiosError<{error?: {msg: string}}>)
                .response?.data.error as {msg: string} | undefined
            void notify({
                status: NotificationStatus.Error,
                title: serverError ? serverError.msg : defaultError,
            })
        } finally {
            delete this.cancelDownloadStat
            this.setState({isDownloading: false})
        }
    }

    render() {
        const {
            name,
            tagColors,
            defaultLoaderHeight,
            stat,
            isFetching,
        } = this.props
        const {isDownloading} = this.state

        if (
            isFetching == null &&
            statsConfig.getIn([name, 'style']) !== 'element'
        ) {
            return null
        }
        const context = {tagColors}
        const config = statsConfig.get(name)
        const statStyle = config.get('style')
        const StatComponent = config.get('component') as
            | ComponentType
            | undefined
        const helpText = config.get('helpText')
        // approximate height of a chart
        const downloadable = config.get('downloadable') || false
        // Loading states of key metrics statistics are displayed inside their components.
        const isLoading = statStyle !== 'key-metrics' && isFetching === true
        const data = config.get('formatData')
            ? (config.get('formatData') as StatConfig['formatData'])!(
                  fromJS(stat?.data.data)
              )
            : fromJS(stat?.data.data)
        const meta = fromJS(stat?.meta)
        const legend =
            !stat || !stat.data
                ? null
                : fromJS((stat.data as TwoDimensionalChart).legend)

        return (
            <div>
                {stat?.data && 'label' in stat.data && stat.data.label ? (
                    <div className="mb-3 d-flex justify-content-between align-items-baseline">
                        <h5 className="mb-0 d-flex" style={{fontSize: '17px'}}>
                            {stat.data.label}
                            {helpText ? (
                                <span>
                                    <StatsHelpIcon id={name} />
                                    <Tooltip placement="top" target={name}>
                                        {helpText}
                                    </Tooltip>
                                </span>
                            ) : null}
                        </h5>
                        {downloadable && !isLoading ? (
                            <Button
                                onClick={this._downloadStatistic}
                                className={css.csvButton}
                                disabled={isDownloading}
                            >
                                {isDownloading ? (
                                    <Loader
                                        size="14px"
                                        minHeight="14px"
                                        className={classnames(
                                            css.csvLoader,
                                            'mr-1'
                                        )}
                                    />
                                ) : (
                                    <i className="material-icons mr-1">
                                        file_download
                                    </i>
                                )}
                                CSV
                            </Button>
                        ) : null}
                    </div>
                ) : null}
                <div>
                    {statStyle === 'element' && StatComponent ? (
                        <StatComponent />
                    ) : isLoading || stat == null ? (
                        <Loader
                            minHeight={
                                statStyle === 'key-metrics'
                                    ? '190px'
                                    : defaultLoaderHeight
                            }
                        />
                    ) : statStyle === 'table' ? (
                        <TableStat
                            context={context}
                            data={data}
                            meta={meta}
                            name={name}
                            config={config}
                        />
                    ) : statStyle === 'per-hour-per-week-table' ? (
                        <PerHourPerWeekTableStat
                            context={context}
                            data={data}
                            meta={meta}
                            name={name}
                            config={config}
                        />
                    ) : statStyle === 'key-metrics' ? (
                        <KeyMetricStat
                            data={data}
                            meta={meta}
                            loading={fromJS(isFetching)}
                            config={config}
                        />
                    ) : statStyle === 'bar' ? (
                        <BarStat data={data} legend={legend} config={config} />
                    ) : statStyle === 'line' ? (
                        <LineStat
                            data={data}
                            legend={legend}
                            config={config}
                            meta={meta}
                        />
                    ) : statStyle === 'sankey' ? (
                        <SankeyStat
                            data={data}
                            legend={legend}
                            config={config}
                        />
                    ) : (
                        <TableStat
                            context={context}
                            data={data}
                            name={name}
                            config={config}
                            meta={meta}
                        />
                    )}
                </div>
            </div>
        )
    }
}

const connector = connect(
    (
        state: RootState,
        {match, name}: OwnProps & RouteComponentProps<{view: string}>
    ) => {
        return {
            // Only `ticket-per-tags` stats needs colors of tags
            tagColors:
                name !== TICKETS_PER_TAG
                    ? null
                    : tagsSelectors
                          .getTags(state)
                          .reduce((tagColors, tag: Map<any, any>) => {
                              return tagColors!.set(
                                  tag.get('name'),
                                  tag.get('decoration')
                              )
                          }, fromJS({}) as Map<any, any>),
            stat: getStatDataByName(name)(state),
            filters: DEPRECATED_makeStatsFiltersSelector(match.params.view)(
                state
            ),
            isFetching: getFetchingStatusByName(name)(state),
            currentUser: getCurrentUser(state),
            account: getCurrentAccountState(state),
        }
    },
    {notify}
)

export default withRouter(connector(StatContainer))
