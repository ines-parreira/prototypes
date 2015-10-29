import React from 'react'

const RuleForm = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault()
        var type = this.refs.type.value.trim()
        var code = this.refs.code.value.trim()

        if (!type || !code) {
            return
        }


        this.props.onCommentSubmit({type: type, code: code})

        this.refs.type.value = ''
        this.refs.code.value = ''

        return
    },
    render: function () {
        return (
            <form className="ruleForm form" onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <label htmlFor="ruletype">Rule type</label>
                    <input type="text" className="form-control" placeholder="Type of the rule" ref="type"
                           id="ruletype"/>
                </div>
                <div className="form-group">
                    <label htmlFor="rulecode">Rule code</label>
                    <textarea type="text" className="form-control" placeholder="Code of the rule" ref="code"
                              id="rulecode"/>
                </div>
                <button type="submit" className="btn btn-default">Submit</button>
            </form>
        );
    }
});

export default RuleForm