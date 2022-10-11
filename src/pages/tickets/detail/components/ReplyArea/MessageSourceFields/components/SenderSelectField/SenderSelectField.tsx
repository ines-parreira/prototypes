import React, {ChangeEventHandler} from 'react'
import classnames from 'classnames'
import {List} from 'immutable'

import css from './SenderSelectField.less'

type Props = {
    tabIndex?: number
    channels: List<any>
    onChange: ChangeEventHandler<HTMLSelectElement>
    value: string
}

const SenderSelectField = ({tabIndex, channels, onChange, value}: Props) => (
    <div className={css.field}>
        <i className={classnames('material-icons', css.arrow)}>
            keyboard_arrow_down
        </i>
        <select
            className={css.select}
            value={value}
            onChange={onChange}
            tabIndex={tabIndex}
        >
            {channels.map((channel: Map<any, any>, index) => (
                <option key={index} value={channel.get('address')}>
                    {channel.get('name')} ({channel.get('address')})
                </option>
            ))}
        </select>
    </div>
)

export default SenderSelectField
