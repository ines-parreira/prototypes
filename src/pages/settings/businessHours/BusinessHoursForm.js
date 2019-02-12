// @flow
import React from 'react'
import {Input} from 'reactstrap'
import type {Map} from 'immutable'

import SelectField from '../../common/forms/SelectField'

import css from './BusinessHours.less'

import {DAYS_OPTIONS} from './constants'


type Props = {
    onChange: (Map<*,*>) => void,
    businessHour: Map<*,*>
}

export default class BusinessHoursForm extends React.Component<Props> {
    _onChange = (newData: Object) => {
        this.props.onChange(this.props.businessHour.merge(newData))
    }

    render() {
        const {businessHour} = this.props

        return (
            <div className={css.businessHoursInput}>
                <SelectField
                    value={businessHour.get('days')}
                    onChange={(value) => this._onChange({days: value})}
                    options={DAYS_OPTIONS.toJS()}
                    fixedWidth
                />
                <Input
                    className={css.timeField}
                    onChange={(e) => this._onChange({from_time: e.target.value})}
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
