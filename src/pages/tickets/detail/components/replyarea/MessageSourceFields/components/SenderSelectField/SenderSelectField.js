import React, {PropTypes} from 'react'
import classnames from 'classnames'

import css from './SenderSelectField.less'

const SenderSelectField = ({value, onChange, channels}) => (
    <div className={css.field}>
        <i className={classnames('fa fa-fw fa-caret-down', css.arrow)} />
        <select
            className={css.select}
            value={value}
            onChange={onChange}
        >
            {
                channels.map((channel, index) => (
                    <option
                        key={index}
                        value={channel.get('address')}
                    >
                        {channel.get('name')} ({channel.get('address')})
                    </option>
                ))
            }
        </select>
    </div>
)

SenderSelectField.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    channels: PropTypes.object.isRequired,
}

export default SenderSelectField
