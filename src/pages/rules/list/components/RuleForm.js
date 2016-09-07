import React from 'react'

import { Field, reduxForm } from 'redux-form'

import classNames from 'classnames'

import { InputField, TextAreaField } from '../../../common/components/semantic'

class RuleForm extends React.Component {

    _handleCancel = () => {
        this.props.onCancel()
        this.props.reset()
    }

    _handleSubmit = (values) => {
        this.props.onSubmit(values)
        this.props.reset()
    }

    render() {
        const { handleSubmit, submitting, valid } = this.props
        const submitButtonClassName = classNames('ui positive button', {
            disabled: submitting || !valid,
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
}

const validate = (values) => {
    const errors = {}

    if (!values.name) errors.name = 'Required'

    return errors
}

export default reduxForm({
    form: 'ruleDetail',
    validate,
})(RuleForm)
