import React from 'react'
import {Field, reduxForm, reset} from 'redux-form'
import classnames from 'classnames'
import {Button} from 'reactstrap'

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

        return (
            <div>
                <form className="ui form" onSubmit={handleSubmit(this._handleSubmit)}>
                    <div className="content">
                        <Field
                            type="text"
                            name="title"
                            label="Rule name"
                            required
                            component={InputField}
                        />
                        <Field
                            type="text"
                            name="description"
                            label="Description"
                            component={TextAreaField}
                            rows="3"
                        />
                    </div>
                    <div className="actions pull-right mt-3">
                        <Button
                            className="mr-2"
                            color="secondary"
                            type="button"
                            onClick={this._handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            className={classnames({
                                'btn-loading': submitting,
                            })}
                            disabled={submitting || !valid || pristine}
                        >
                            Create rule
                        </Button>
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
