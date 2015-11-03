import React from 'react'

class RuleForm extends React.Component {
    constructor() {
        super()
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleSubmit(e) {
        e.preventDefault()
        var type = this.refs.type.value.trim()
        var code = this.refs.code.value.trim()

        if (!type || !code) {
            return
        }


        const { rules, actions } = this.props
        actions.submitRule("/api/rules/", {type: type, code: code})

        this.refs.type.value = ''
        this.refs.code.value = ''

        return
    }

    render() {
        return (
            <form className="ui form" onSubmit={this.handleSubmit}>
                <div className="field">
                    <label htmlFor="ruletype">Rule type</label>
                    <input type="text" className="form-control" placeholder="Type of the rule" ref="type"
                           id="ruletype"/>
                </div>
                <div className="field">
                    <label htmlFor="rulecode">Rule code</label>
                    <textarea type="text" className="form-control" placeholder="Code of the rule" ref="code"
                              id="rulecode"/>
                </div>
                <button type="submit" className="ui positive button">Submit</button>
            </form>
        )
    }
}

export default RuleForm