import React, {PropTypes} from 'react'
import classnames from 'classnames'

export default class  extends React.Component {
    static propTypes = {
        inline: PropTypes.bool.isRequired,
        input: PropTypes.object.isRequired,
        disabled: PropTypes.bool.isRequired
    }

    static defaultProps = {
        disabled: false,
        inline: false
    }

    _onClick = (e) => {
        e.preventDefault()
        return this.props.input.onChange(!this.props.input.value)
    }

    render() {
        const style = {}
        if (this.props.inline) {
            style.verticalAlign = 'middle'
        }

        return (
            <div
                className={classnames('ui toggle checkbox', {
                    'd-flex': !this.props.inline
                })}
                onClick={this._onClick}
                style={style}
            >
                <input
                    type="checkbox"
                    checked={this.props.input.value}
                    readOnly
                    disabled={this.props.disabled}
                />
                <label
                    style={{
                        margin: 0,
                        paddingLeft: '52px' // perfect width (no extra space on the right of the toggle)
                    }}
                />
            </div>
        )
    }
}
