import React from 'react'

class DropdownButton extends React.Component {
    handleChange(event){
        const {actions, index, parent } = this.props
        console.log(event.target.value)
        actions.modifyCodeast(index, parent)

        this.props.parent.map(function(value, idx){
            console.log(value)
        })
        console.log(this.props.index)
        console.log(this.props.actions)
    }

    render() {
        return (
            <select className="ui dropdown" value="{ this.props.text }" onChange={ this.handleChange.bind(this) }>
                <option>{ this.props.text }</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
        )
    }
}

export default DropdownButton