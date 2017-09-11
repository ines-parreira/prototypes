import React, {PropTypes} from 'react'
import moment from 'moment'
import classnames from 'classnames'
import {UncontrolledTooltip, Table} from 'reactstrap'

import {renderDifference, comparedPeriodString} from '../../utils'

export default class TableStat extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        data: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
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
    render() {
        const {data} = this.props

        return (
            <Table hover>
                <thead>
                    <tr>
                        {
                            data.getIn(['axes', 'x']).map((axe, index) => {
                                return (
                                    <th
                                        key={index}
                                        className={classnames({
                                            'text-center': index > 0,
                                        })}
                                    >
                                        {axe.get('name').toUpperCase()}
                                    </th>
                                )
                            })
                        }
                    </tr>
                </thead>
                <tbody>
                    {data.get('lines').isEmpty() ? (
                        <tr>
                            <td
                                colSpan="100"
                                className="text-muted"
                            >
                                There is no data for this period.
                            </td>
                        </tr>
                    ) : data.get('lines').map((line, lineIdx) =>
                        <tr key={lineIdx}>
                            {
                                line.map((val, valIdx) => {
                                    const type = data.getIn(['axes', 'x',  valIdx, 'type'])
                                    return (
                                        <td
                                            key={valIdx}
                                            className={classnames({
                                                'text-center': valIdx > 0,
                                            })}
                                        >
                                            {this._renderCell(val, type, lineIdx)}
                                        </td>
                                    )
                                })
                            }
                        </tr>
                    ).toList()
                    }
                </tbody>
            </Table>
        )
    }
}

