import React from 'react'

const DEFAULT_OPTIONS = [
    {
        label: 'label',
        value: 'value'
    }
]

class DropdownButton extends React.Component {

    handleChange(event) {
        const {actions, index, parent, options } = this.props
        actions.modifyCodeast(index, parent, event.target.value, 'UPDATE')
    }

    render() {
        let options = this.props.options

        if (options === undefined) {
            options = DEFAULT_OPTIONS
        }

        const optionItems = options.map(function(option, idx) {
            return <option value={option.value} key={idx}>{option.label}</option>
        })
        return (
            <select className="ui dropdown" value={ this.props.text } onChange={ this.handleChange.bind(this) }>
                { optionItems }
                <option value={ this.props.text } key={-1}>{ this.props.text }</option>
            </select>
        )
    }
}

export default DropdownButton