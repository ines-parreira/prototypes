// @flow
import React, {Component} from 'react'
import {fromJS} from 'immutable'
import {Button} from 'reactstrap'
import {connect} from 'react-redux'
import axios from 'axios'

import * as tagsSelectors from '../../../../../state/tags/selectors'
import {TICKETS_PER_TAG} from '../../../../../config/stats'
import css from '../../../style.less'
import Tooltip from '../../../../common/components/Tooltip'
import Loader from '../../../../common/components/Loader/Loader'
import {notify} from '../../../../../state/notifications/actions'
import GorgiasApi from '../../../../../services/gorgiasApi'

import {saveFileAsDownloaded} from '../../../../../utils/file'

import LineStat from './LineStat'
import TableStat from './TableStat/TableStat'
import KeyMetricStat from './KeyMetricStat/KeyMetricStat'
import BarStat from './BarStat'

type Props = {
    data: Object,
    config: Object,
    filters: Object,
    meta?: Object,
    label?: string,
    tagColors?: Object,
    downloadable?: boolean,
    isLoading?: boolean,
    name: string,
    notify: typeof notify
}

type State = {
    isDownloading: boolean
}

export class Stat extends Component<Props, State> {
    static defaultProps = {
        downloadable: false,
        isLoading: false
    }

    gorgiasApi = new GorgiasApi()
    state = {
        isDownloading: false
    }

    componentWillUnmount() {
        this.gorgiasApi.cancelPendingRequests()
    }

    _downloadStatistic = async() => {
        const {name, filters, notify} = this.props

        this.setState({isDownloading: true})
        try {
            const file = await this.gorgiasApi.downloadStatistic(name, fromJS({filters}))
            saveFileAsDownloaded(file.get('name'), file.get('contentType'), file.get('data'))
        } catch (error) {
            if (axios.isCancel(error)) {
                return
            }

            const defaultError = 'Failed to download statistics. Please retry in a few seconds.'
            const serverError = error.response.data.error
            notify({
                status: 'error',
                title: serverError ? serverError.msg : defaultError
            })
        } finally {
            this.setState({isDownloading: false})
        }
    }

    render() {
        const {isDownloading} = this.state
        const {name, label, tagColors, isLoading} = this.props
        const context = {tagColors}
        const style = this.props.config.get('style')
        const helpText = this.props.config.get('helpText')
        // approximate height of a chart
        let loaderHeight = '400px'
        let downloadable = this.props.config.get('downloadable') || false
        let StatComponent = TableStat

        switch (style) {
            case 'table':
                StatComponent = TableStat
                break
            case 'key-metrics':
                StatComponent = KeyMetricStat
                loaderHeight = '190px'
                break
            case 'bar':
                StatComponent = BarStat
                break
            case 'line':
                StatComponent = LineStat
                break
            default:
                StatComponent = TableStat
        }

        return (
            <div>
                {this.props.label ?
                    <div className="mb-3 d-flex justify-content-between align-items-baseline">
                        <h5
                            className="mb-0 d-flex"
                            style={{fontSize: '17px'}}
                        >
                            {label}
                            {helpText ?
                                <span>
                                    <i
                                        id={name}
                                        className={`${css['help-icon']} material-icons ml-2`}
                                    >
                                        info_outline
                                    </i>
                                    <Tooltip
                                        placement="top"
                                        target={name}
                                    >
                                        {helpText}
                                    </Tooltip>
                                </span>
                                : null}
                        </h5>
                        {downloadable && !isLoading ?
                            <Button
                                onClick={this._downloadStatistic}
                                className="btn btn-secondary btn-transparent"
                                disabled={isDownloading}
                            >
                                {isDownloading
                                    ? <i className="material-icons mr-1">refresh</i>
                                    : <i className="material-icons mr-1">file_download</i>
                                }
                                CSV
                            </Button>
                            : null}
                    </div>
                    : null
                }
                <div>
                    {isLoading ?
                        <Loader minHeight={loaderHeight}/>
                        :
                        <StatComponent
                            context={context}
                            {...this.props}
                        />
                    }
                </div>
            </div>
        )
    }
}

export default connect((state, props) => {
    // Only `ticket-per-tags` stats needs colors of tags
    if (props.name !== TICKETS_PER_TAG) {
        return {
            tagColors: null
        }
    }

    return {
        tagColors: tagsSelectors.getTags(state).reduce((tagColors, tag) => {
            return tagColors.set(tag.get('name'), tag.get('decoration'))
        }, fromJS({}))
    }
}, {notify})(Stat)
