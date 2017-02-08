import React from 'react'
import css from './SenderSelectField.less'

const SenderSelectField = ({input, channels}) => (
    <div className={css.field}>
        <i className={`icon caret down ${css.arrow}`}/>
        <select className={css.select}
            {...input}
        >
            {channels.map((channel, index) => (
                <option key={index} value={channel.get('address')}>
                    {`${channel.get('name', '')} (${channel.get('address')})`}
                </option>
            ))}
        </select>
    </div>
)

SenderSelectField.propTypes = {
    input: React.PropTypes.object.isRequired,
    channels: React.PropTypes.object.isRequired,
}

export default SenderSelectField
