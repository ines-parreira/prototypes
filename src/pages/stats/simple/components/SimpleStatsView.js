import React, {PropTypes} from 'react'
import moment from 'moment'

import PeriodPicker from '../../common/PeriodPicker'
import PageHeader from '../../../common/components/PageHeader'
import Loader from '../../../common/components/Loader'
import Stat from '../../common/components/charts/Stat'
import {humanizeString} from '../../../../utils'
import {config as statsConfig} from '../../../../config/stats'

export default class SimpleStatsView extends React.Component {
    componentDidMount() {
        this.props.fetchStats({type: this.props.type})
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.type !== nextProps.type) {
            this.props.fetchStats({type: nextProps.type})
        }
    }

    _handleDateChange = (meta) => {
        meta.type = this.props.type
        this.props.fetchStats(meta)
    }

    render() {
        const {stats, type, meta, isLoading} = this.props
        const startDatetime = moment(meta.get('start_datetime'))
        const endDatetime = moment(meta.get('end_datetime'))

        return (
            <div className="stats">
                <PageHeader title={humanizeString(type)}>
                    <div className="d-flex pull-right">
                        <PeriodPicker
                            startDatetime={startDatetime}
                            endDatetime={endDatetime}
                            onChange={this._handleDateChange}
                            isDisabled={isLoading}
                        />
                    </div>
                </PageHeader>
                {isLoading || stats.isEmpty() ?
                    <Loader/>
                    :
                    stats.map((stat, idx) => {
                        const config = statsConfig.get(stat.get('name'))
                        return (
                            <Stat
                                key={idx}
                                config={config}
                                meta={meta}
                                {...stat.toObject()}
                            />
                        )
                    })
                }
            </div>
        )
    }
}

SimpleStatsView.propTypes = {
    fields: PropTypes.object.isRequired,
    type: PropTypes.string,
    stats: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    fetchStats: PropTypes.func.isRequired,
}
