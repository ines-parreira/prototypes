import React, {PropTypes} from 'react'

export default class Input extends React.Component {
    handleChange(event) {
        const {actions, index, parent} = this.props

        actions.modifyCodeast(index, parent, event.target.value, 'UPDATE')
    }

    render() {
        const {widgetType} = this.props

        switch (widgetType) {
            case 'input':
                return (
                    <input className="" value={this.props.value} onChange={this.handleChange.bind(this)}/>
                )
            case 'textarea':
                return (
                    <textarea className="" value={this.props.value}
                              onChange={this.handleChange.bind(this)}/>
                )
            default:
                return (
                    <div className="ui red horizontal label"> Not recognized type with value: {this.props.value}</div>
                )
        }
    }
}

Input.propTypes = {
    actions: PropTypes.object
}
