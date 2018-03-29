// @flow
import React from 'react'
import BarStat from '../BarStat'
import KeyMetricStat from '../KeyMetricStat'
import TableStat from '../TableStat'
import LineStat from '../LineStat'
import {Button, Card, CardBody} from 'reactstrap'
import {downloadStatistic} from '../../../../../../state/stats/actions'
import {connect} from 'react-redux'
import css from './Stat.less'

type Props = {
    config: Object,
    filters: Object,
    label?: string,
    meta: Object,
    downloadable?: boolean,
    name: string,
    downloadStatistic: Function
}

type State = {
    isDownloading: boolean
}

@connect(null, {
    downloadStatistic
})
export default class Stat extends React.Component<Props, State> {
    static defaultProps = {
        downloadable: false
    }

    state = {
        isDownloading: false
    }

    _downloadStatistic = () => {
        const {name, meta, filters} = this.props

        this.setState({isDownloading: true})
        this.props.downloadStatistic(name, meta.toJS(), filters.toJS())
            .then(() => this.setState({isDownloading: false}))
            .catch(() => this.setState({isDownloading: false}))
    }

    render() {
        const {isDownloading} = this.state
        const style = this.props.config.get('style')
        let downloadable = this.props.config.get('downloadable') || false
        let Component = TableStat

        switch (style) {
            case 'table':
                Component = TableStat
                break
            case 'key-metrics':
                Component = KeyMetricStat
                break
            case 'bar':
                Component = BarStat
                break
            case 'line':
                Component = LineStat
                break
            default:
                Component = TableStat
        }

        return (
            <Card className="stats-card mb-3">
                <CardBody>
                    <div className={`${css['stat-header']} mb-4`}>
                        <h5 className="text-center">
                            {this.props.label}
                        </h5>
                        {downloadable ?
                            <Button
                                onClick={this._downloadStatistic}
                                className={`btn btn-secondary btn-transparent ${css['btn-download']}`}
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
                    <div>
                        <Component {...this.props}/>
                    </div>
                </CardBody>
            </Card>
        )
    }
}
