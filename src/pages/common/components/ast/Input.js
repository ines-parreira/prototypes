import React from 'react'

class Input extends React.Component {

    _handleChange = (event) => {
        const { actions, index, parent } = this.props
        actions.modifyCodeast(index, parent, event.target.value, 'UPDATE')
    }

    render() {
        const { widgetType } = this.props

        switch (widgetType) {
            case 'input':
                return <input value={this.props.value} onChange={this._handleChange} />
            case 'textarea':
                return <textarea value={this.props.value} onChange={this._handleChange} />
            default:
                return (
                    <div className="ui red horizontal label">
                        Not recognized type with value: {this.props.value}
                    </div>
                )
        }
    }

}

Input.propTypes = {
    actions: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    parent: React.PropTypes.object.isRequired,
    value: React.PropTypes.string.isRequired,
    widgetType: React.PropTypes.string.isRequired,
}

export default Input
