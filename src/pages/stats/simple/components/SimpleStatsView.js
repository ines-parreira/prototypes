import React, {PropTypes} from 'react'
import moment from 'moment'
import {UncontrolledTooltip} from 'reactstrap'

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

    _handleDateChange = (meta) => {
        meta.type = this.props.type
        this.props.fetchStats(meta)
    }

    // render a value depending on its type (like a percent, a delta, etc.)
    _renderCell = (value, type, index) => {
        const {meta} = this.props

        switch (type) {
            case 'delta': {
                const previousStartDatetime = moment(meta.get('previous_start_datetime'))
                const previousEndDatetime = moment(meta.get('previous_end_datetime'))

                const tooltipDelta = comparedPeriodString(previousStartDatetime, previousEndDatetime)

                const id = `difference-${index}`

                return (
                    <span>
                        <span id={id}>
                            {renderDifference(value)}
                        </span>
                        <UncontrolledTooltip
                            placement="top"
                            target={id}
                            delay={0}
                        >
                            {tooltipDelta}
                        </UncontrolledTooltip>
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

        const columns = ['name', 'count', 'delta', 'percentage']

        return (
            <table className="ui  padded single line table">
                <thead>
                    <tr>
                        {
                            fields
                                .map(field => field.get('label'))
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
                                    <td
                                        colSpan="100"
                                        className="text-muted"
                                    >
                                        There is no data for this period.
                                    </td>
                                </tr>
                            ) : stats.map((row, index) =>
                                <tr key={index}>
                                    {
                                        columns.map((type) => {
                                            const cell = row.get(type)
                                            const field = fields.find(f => f.get('name') === type)

                                            return (
                                                <td key={type}>
                                                    {this._renderCell(cell, field.get('type'), index)}
                                                </td>
                                            )
                                        })
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
