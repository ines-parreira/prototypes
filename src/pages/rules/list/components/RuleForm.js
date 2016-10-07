import React from 'react'

import { Field, reduxForm, reset } from 'redux-form'

import classNames from 'classnames'

import { InputField, TextAreaField } from '../../../common/components/semantic'

class RuleForm extends React.Component {

    _handleCancel = () => {
        this.props.onCancel()
        this.props.reset()
    }

    _handleSubmit = (values) => {
        this.props.onSubmit(values)
    }

    render() {
        const { handleSubmit, pristine, submitting, valid } = this.props
        const submitButtonClassName = classNames('ui positive button', {
            disabled: submitting || !valid || pristine,
            loading: submitting,
        })

        return (
            <form className="ui form" onSubmit={handleSubmit(this._handleSubmit)}>
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
                <button type="submit" className={submitButtonClassName}>
                    Submit
                </button>
                <button type="button" className="ui button" onClick={this._handleCancel}>
                    Cancel
                </button>
            </form>
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

const validate = (values) => {
    const errors = {}

    if (!values.title) {
        errors.title = 'Required'
    }

    return errors
}

export default reduxForm({
    form: 'ruleDetail',
    onSubmitSuccess: (_, dispatch) => dispatch(reset('ruleDetail')),
    validate,
})(RuleForm)
