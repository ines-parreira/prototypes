import React, {Component} from 'react'
import {Input} from 'reactstrap'
import {Map} from 'immutable'

import {SelectableOption} from 'pages/common/forms/SelectField/types'
import SelectField from '../../common/forms/SelectField/SelectField'

import css from './BusinessHours.less'

import {DAYS_OPTIONS} from './constants'

type Props = {
    onChange: (map: Map<any, any>) => void
    businessHour: Map<any, any>
}

export default class BusinessHoursForm extends Component<Props> {
    _onChange = (newData: Record<string, unknown>) => {
        this.props.onChange(this.props.businessHour.merge(newData))
    }

    render() {
        const {businessHour} = this.props
        return (
            <div className={css.businessHoursInput}>
                <SelectField
                    value={businessHour.get('days')}
                    onChange={(value) => this._onChange({days: value})}
                    options={DAYS_OPTIONS as SelectableOption[]}
                    fixedWidth
                />
                <Input
                    className={css.timeField}
                    onChange={(e) =>
                        this._onChange({from_time: e.target.value})
                    }
                    value={businessHour.get('from_time')}
                    type="time"
                    pattern="[0-9][0-9]:[0-9][0-9]"
                    name="fromTime"
                />
                <p>to</p>
                <Input
                    className={css.timeField}
                    onChange={(e) => this._onChange({to_time: e.target.value})}
                    value={businessHour.get('to_time')}
                    type="time"
                    pattern="[0-9][0-9]:[0-9][0-9]"
                    name="toTime"
                />
            </div>
        )
    }
}
