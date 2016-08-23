import React, {PropTypes} from 'react'

export default class RuleForm extends React.Component {
    render() {
        return (
            <form className="ui form" onSubmit={this.props.handleSubmit}>
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

RuleForm.propTypes = {
    handleSubmit: PropTypes.func
}
