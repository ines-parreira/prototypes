import React, {Component} from 'react'
import {fromJS, Map} from 'immutable'
import {Button} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import axios, {AxiosError} from 'axios'
import _pick from 'lodash/pick'

import * as tagsSelectors from '../../../../../state/tags/selectors'
import {TICKETS_PER_TAG} from '../../../../../config/stats'
import Tooltip from '../../../../common/components/Tooltip'
import Loader from '../../../../common/components/Loader/Loader'
import {notify} from '../../../../../state/notifications/actions'
import GorgiasApi from '../../../../../services/gorgiasApi'
import {RootState} from '../../../../../state/types'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {saveFileAsDownloaded} from '../../../../../utils/file'
import StatsHelpIcon from '../StatsHelpIcon'

import LineStat from './LineStat'
import TableStat from './TableStat/TableStat.js'
import PerHourPerWeekTableStat from './PerHourPerWeekTableStat/PerHourPerWeekTableStat.js'
import KeyMetricStat from './KeyMetricStat/KeyMetricStat.js'
import BarStat from './BarStat.js'

type OwnProps = {
    data: Map<any, any>
    config: Map<any, any>
    filters: Map<any, any>
    legend: Map<any, any>
    meta: Map<any, any>
    label?: string
    downloadable?: boolean
    loading: boolean | Record<string, unknown>
    name: string
    defaultLoaderHeight: string
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

    gorgiasApi = new GorgiasApi()
    state = {
        isDownloading: false,
    }

    componentWillUnmount() {
        this.gorgiasApi.cancelPendingRequests()
    }

    _downloadStatistic = async () => {
        const {name, filters, notify} = this.props

        this.setState({isDownloading: true})
        try {
            const file = await this.gorgiasApi.downloadStatistic(
                name,
                fromJS({filters})
            )
            saveFileAsDownloaded(
                file.get('name'),
                file.get('contentType'),
                file.get('data')
            )
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
            this.setState({isDownloading: false})
        }
    }

    render() {
        const {isDownloading} = this.state
        const {
            name,
            label,
            tagColors,
            loading,
            config,
            defaultLoaderHeight,
        } = this.props
        const context = {tagColors}
        const style = config.get('style')
        const helpText = config.get('helpText')
        // approximate height of a chart
        const downloadable = config.get('downloadable') || false
        // Loading states of key metrics statistics are displayed inside their components.
        const isLoading = style !== 'key-metrics' && loading === true

        return (
            <div>
                {this.props.label ? (
                    <div className="mb-3 d-flex justify-content-between align-items-baseline">
                        <h5 className="mb-0 d-flex" style={{fontSize: '17px'}}>
                            {label}
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
                                className="btn btn-secondary btn-transparent"
                                disabled={isDownloading}
                            >
                                {isDownloading ? (
                                    <i className="material-icons mr-1">
                                        refresh
                                    </i>
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
                    {isLoading ? (
                        <Loader
                            minHeight={
                                style === 'key-metrics'
                                    ? '190px'
                                    : defaultLoaderHeight
                            }
                        />
                    ) : style === 'table' ? (
                        <TableStat
                            context={context}
                            {..._pick(this.props, [
                                'data',
                                'config',
                                'meta',
                                'name',
                            ])}
                        />
                    ) : style === 'per-hour-per-week-table' ? (
                        <PerHourPerWeekTableStat
                            context={context}
                            {..._pick(this.props, [
                                'data',
                                'config',
                                'meta',
                                'name',
                            ])}
                        />
                    ) : style === 'key-metrics' ? (
                        <KeyMetricStat
                            {..._pick(this.props, [
                                'data',
                                'config',
                                'meta',
                                'loading',
                            ])}
                        />
                    ) : style === 'bar' ? (
                        <BarStat
                            {..._pick(this.props, ['data', 'config', 'legend'])}
                        />
                    ) : style === 'line' ? (
                        <LineStat
                            {..._pick(this.props, [
                                'data',
                                'legend',
                                'config',
                                'meta',
                            ])}
                        />
                    ) : (
                        <TableStat
                            context={context}
                            {..._pick(this.props, [
                                'data',
                                'config',
                                'meta',
                                'name',
                            ])}
                        />
                    )}
                </div>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState, props: OwnProps) => {
        // Only `ticket-per-tags` stats needs colors of tags
        if (props.name !== TICKETS_PER_TAG) {
            return {
                tagColors: null,
            }
        }

        return {
            tagColors: tagsSelectors
                .getTags(state)
                .reduce((tagColors, tag: Map<any, any>) => {
                    return tagColors!.set(
                        tag.get('name'),
                        tag.get('decoration')
                    )
                }, fromJS({}) as Map<any, any>),
        }
    },
    {notify}
)

export default connector(StatContainer)
