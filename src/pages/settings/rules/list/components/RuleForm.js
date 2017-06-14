import React from 'react'
import {Field, reduxForm, reset} from 'redux-form'
import classnames from 'classnames'
import {Form, Button} from 'reactstrap'

import formSender from '../../../../common/utils/formSender'

import ReduxFormInputField from '../../../../common/forms/ReduxFormInputField'

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
                <Form onSubmit={handleSubmit(this._handleSubmit)}>
                    <div className="content">
                        <Field
                            type="text"
                            name="title"
                            label="Name"
                            required
                            component={ReduxFormInputField}
                        />
                        <Field
                            type="textarea"
                            name="description"
                            label="Description"
                            rows="3"
                            component={ReduxFormInputField}
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
                            type="submit"
                            color="primary"
                            className={classnames({
                                'btn-loading': submitting,
                            })}
                            disabled={submitting || !valid || pristine}
                        >
                            Create rule
                        </Button>
                    </div>
                </Form>
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
