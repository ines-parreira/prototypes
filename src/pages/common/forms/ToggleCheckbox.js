import React, {PropTypes} from 'react'

export default class ToggleCheckBox extends React.Component {
    static propTypes = {
        input: PropTypes.object.isRequired,
        disabled: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        disabled: false,
    }

    _onClick = (e) => {
        e.preventDefault()
        return this.props.input.onChange(!this.props.input.value)
    }

    render() {
        return (
            <div
                className="ui toggle checkbox d-flex"
                onClick={this._onClick}
            >
                <input
                    type="checkbox"
                    checked={this.props.input.value}
                    readOnly
                    disabled={this.props.disabled}
                />
                <label style={{margin: 0}} />
            </div>
        )
    }
}
