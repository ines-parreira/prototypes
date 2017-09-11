import React, {PropTypes} from 'react'
import BarStat from './BarStat'
import KeyMetricStat from './KeyMetricStat'
import TableStat from './TableStat'
import LineStat from './LineStat'
import {Card, CardBlock} from 'reactstrap'

export default class Stat extends React.Component {
    static propTypes = {
        config: PropTypes.object.isRequired,
        label: PropTypes.string
    }

    render() {
        let Component = TableStat
        const style = this.props.config.get('style')

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
                <CardBlock>
                    <h5 className="text-center">{this.props.label}</h5>
                    <div>
                        <Component {...this.props}/>
                    </div>
                </CardBlock>
            </Card>
        )
    }
}
