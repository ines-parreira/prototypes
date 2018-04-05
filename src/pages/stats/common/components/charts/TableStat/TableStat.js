import React, {PropTypes} from 'react'
import moment from 'moment'
import _isFunction from 'lodash/isFunction'
import {Table} from 'reactstrap'
import css from './TableStat.less'
import Tooltip from '../../../../../common/components/Tooltip'
import {renderDifference, comparedPeriodString} from '../../../utils'

export default class TableStat extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        data: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
        config: PropTypes.object.isRequired,
        context: PropTypes.object
    }

    // render a value depending on its type (like a percent, a delta, etc.)
    _renderCell = (line, value, type, index) => {
        const {meta, config, context} = this.props
        let callback = config.getIn(['callbacks', 'cell'])

        if (!_isFunction(callback)) {
            callback = ((line, val) => val)
        }

        switch (type) {
            case 'delta': {
                const previousStartDatetime = moment(meta.get('previous_start_datetime'))
                const previousEndDatetime = moment(meta.get('previous_end_datetime'))

                const tooltipDelta = comparedPeriodString(previousStartDatetime, previousEndDatetime)

                const id = `difference-${index}`

                return (
                    <span>
                        <span id={id}>
                            {renderDifference(callback(line, value, context), value)}
                        </span>
                        <Tooltip
                            placement="top"
                            target={id}
                        >
                            {tooltipDelta}
                        </Tooltip>
                    </span>
                )
            }
            case 'percent': {
                return callback(line, `${value}%`, context)
            }
            default:
                return callback(line, value, context)
        }
    }

    // render the table
    render() {
        const {data} = this.props

        return (
            <Table hover className={css.table}>
                <thead>
                    <tr>
                        {data.getIn(['axes', 'x']).map((axe, index) => {
                            return (
                                <th key={index}>
                                    <span className={css['cell-wrapper']}>
                                        {axe.get('name').toUpperCase()}
                                    </span>
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {data.get('lines').isEmpty() ? (
                        <tr>
                            <td colSpan="100" className="text-muted">
                                There is no data for this period.
                            </td>
                        </tr>
                    ) : data.get('lines').map((line, lineIdx) =>
                        <tr key={lineIdx}>
                            {line.map((val, valIdx) => {
                                const type = data.getIn(['axes', 'x', valIdx, 'type'])
                                return (
                                    <td key={valIdx}>
                                        <span className={css['cell-wrapper']}>
                                            {this._renderCell(line, val, type, lineIdx)}
                                        </span>
                                    </td>
                                )
                            })}
                        </tr>
                    ).toList()
                    }
                </tbody>
            </Table>
        )
    }
}

