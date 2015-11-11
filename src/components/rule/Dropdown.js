import React from 'react'

class DropdownButton extends React.Component {

    handleChange(event){
        const {actions, index, parent } = this.props
        actions.modifyCodeast(index, parent, event.target.value)
    }

    render() {
        return (
            <select className="ui dropdown" value="{ this.props.text }" onChange={ this.handleChange.bind(this) }>
                <option>{ this.props.text }</option>
                <option>send_notification_to_user</option>
                <option>action_add_tag_to_ticket</option>
                <option>twitter</option>
                <option>facebook</option>
                <option>closed</option>
                <option>open</option>
            </select>
        )
    }
}

export default DropdownButton