import React, {PropTypes} from 'react'
import moment from 'moment'
import {renderDifference, comparedPeriodString} from '../../common/utils'
import PeriodPicker from '../../common/PeriodPicker'
import PageHeader from '../../../common/components/PageHeader'
import {Loader} from '../../../common/components/Loader'
import {humanizeString} from '../../../../utils'

export default class SimpleStatsView extends React.Component {
    componentDidMount() {
        this.props.fetchStats({type: this.props.type})
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.type !== nextProps.type) {
            this.props.fetchStats({type: nextProps.type})
        }
    }

    componentDidUpdate() {
        $('.tooltip').popup()
    }

    _handleDateChange = (meta) => {
        meta.type = this.props.type
        this.props.fetchStats(meta)
    }

    // render a value depending on its type (like a percent, a delta, etc.)
    _renderCell = (value, type) => {
        const {meta} = this.props

        switch (type) {
            case 'delta': {
                const previousStartDatetime = moment(meta.get('previous_start_datetime'))
                const previousEndDatetime = moment(meta.get('previous_end_datetime'))

                const tooltipDelta = comparedPeriodString(previousStartDatetime, previousEndDatetime)

                return (
                    <span
                        className="tooltip"
                        data-content={tooltipDelta}
                        data-variation="wide inverted"
                    >
                        {renderDifference(value)}
                    </span>
                )
            }
            case 'percent': {
                return `${value}%`
            }
            default:
                return value
        }
    }

    // render the table
    _renderStatistics = () => {
        const {stats, fields} = this.props

        return (
            <table className="ui  padded single line table">
                <thead>
                    <tr>
                        {
                            fields
                                .map(field => field.get('name'))
                                .map((field, index) =>
                                    <th key={index}>
                                        {field.toUpperCase()}
                                    </th>
                                )
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        stats.isEmpty() ? (
                            <tr>
                                <td colSpan="100">There is no data for this period.</td>
                            </tr>
                        ) : stats.map((row, index) =>
                            <tr key={index}>
                                {
                                    row.map((cell, _index) =>
                                        <td key={_index}>
                                            {this._renderCell(cell, fields.getIn([_index, 'type']))}
                                        </td>
                                    )
                                }
                            </tr>
                        ).toList()
                    }
                </tbody>
            </table>
        )
    }

    render() {
        const {type, meta, isLoading} = this.props

        const startDatetime = moment(meta.get('start_datetime'))
        const endDatetime = moment(meta.get('end_datetime'))

        return (
            <div className="view stats">
                <PageHeader title={humanizeString(type)}>
                    <div className="ui right floated flex">
                        <PeriodPicker
                            startDatetime={startDatetime}
                            endDatetime={endDatetime}
                            period={meta.get('period')}
                            onChange={this._handleDateChange}
                            isDisabled={isLoading}
                        />
                    </div>
                </PageHeader>
                {isLoading ? <Loader loading /> : this._renderStatistics()}
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
