import React from 'react'

import {Field, reduxForm, reset} from 'redux-form'

import classNames from 'classnames'

import InputField from '../../../common/forms/InputField'
import TextAreaField from '../../../common/forms/TextAreaField'
import formSender from '../../../common/utils/formSender'

class RuleForm extends React.Component {

    _handleCancel = () => {
        this.props.onCancel()
        this.props.reset()
    }

    _handleSubmit = (values) => {
        return formSender(this.props.onSubmit(values))
    }

    render() {
        const {handleSubmit, pristine, submitting, valid} = this.props
        const submitButtonClassName = classNames('ui positive button', {
            disabled: submitting || !valid || pristine,
            loading: submitting,
        })

        return (
            <div ref="modal">
                <div className="header">
                    Create new Rule
                    <i
                        className="remove action icon modal-close"
                        onClick={this.props.onCancel}
                    />
                </div>
                <form className="ui form" onSubmit={handleSubmit(this._handleSubmit)}>
                    <div className="content">
                        <Field
                            type="text"
                            name="title"
                            placeholder="Rule name"
                            required
                            component={InputField}
                        />
                        <Field
                            type="text"
                            name="description"
                            placeholder="Description"
                            component={TextAreaField}
                        />
                    </div>
                    <div className="actions">
                        <button type="button" className="ui button" onClick={this._handleCancel}>
                            Cancel
                        </button>
                        <button type="submit" className={submitButtonClassName}>
                            Create new rule
                        </button>
                    </div>
                </form>
            </div>
        )
    }
}

RuleForm.propTypes = {
    handleSubmit: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    pristine: React.PropTypes.bool.isRequired,
    reset: React.PropTypes.func.isRequired,
    submitting: React.PropTypes.bool.isRequired,
    valid: React.PropTypes.bool.isRequired,
}

export default reduxForm({
    form: 'ruleDetail',
    onSubmitSuccess: (_, dispatch) => dispatch(reset('ruleDetail')),
})(RuleForm)
