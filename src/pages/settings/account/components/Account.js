import React, {Component, PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form'
import {InputField} from '../../../common/components/formFields'
import classNames from 'classnames'
import {isEmail} from '../../../../utils'
import formSender from '../../../common/utils/formSender'
import css from './Account.less'

class Account extends Component {
    static propTypes = {
        account: PropTypes.object.isRequired,
        isSubmitting: PropTypes.bool.isRequired,
        invalid: PropTypes.bool.isRequired,
        pristine: PropTypes.bool.isRequired,
        handleSubmit: PropTypes.func.isRequired,
        updateAccount: PropTypes.func.isRequired,
        initialValues: PropTypes.object.isRequired
    }

    componentDidMount() {
        $(this.refs.accountTooltip).popup({
            inline: true,
            position: 'top left',
            offset: -11
        })
    }

    _updateAccount = (values) => {
        return formSender(this.props.updateAccount(values))
    }

    render() {
        const {
            account, isSubmitting, handleSubmit, invalid, pristine,
            initialValues: {channels}
        } = this.props

        return (
            <div className="ui grid">
                <div className="sixteen wide column">
                    <h1>
                        <i className="setting blue icon ml5ni mr10i"/>
                        Account
                    </h1>
                    <div>
                        Adjust team-wide settings for <strong>{account.get('domain')}</strong>.
                    </div>
                </div>
                <div className="height wide column">
                    <form className="ui form" onSubmit={handleSubmit(this._updateAccount)}>
                        <h4 className={`ui dividing header ${css.formEmailHeader}`}>
                            Your default support email
                            <span ref="accountTooltip"
                                className="inverted tooltip"
                                data-content="The address you use to send emails to customers in Gorgias."
                                data-variation="inverted"
                            >
                                <i className="help circle link icon"/>
                            </span>
                        </h4>
                        {channels.map((channel, index) => (
                            <div key={index} className="fields">
                                <div className="eight wide field">
                                    <Field
                                        type="text"
                                        label="Name"
                                        name={`channels.${index}.name`}
                                        placeholder="Acme Support"
                                        component={InputField}
                                    />
                                </div>
                                <div className="eight wide field">
                                    <Field
                                        type="email"
                                        label="Email"
                                        name={`channels.${index}.address`}
                                        placeholder="support@acme.com"
                                        component={InputField}
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="field">
                            <button className={classNames('ui', 'green', 'button', {
                                loading: isSubmitting,
                                disabled: invalid || pristine
                            })}>
                                Save changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

const validate = (values) => {
    const channels = values.channels
    const errors = {
        channels: []
    }

    if (channels && channels.length) {
        channels.forEach((channel, index) => {
            const channelError = {}

            if (!channel.name) {
                channelError.name = 'A name is required'
            }

            if (!channel.address) {
                channelError.address = 'An address is required'
            } else if (channel.type === 'email' && !isEmail(channel.address)) {
                channelError.address = 'Address must be an email'
            }

            errors.channels.splice(index, 0, channelError)
        })
    }

    return errors
}

export default reduxForm({
    form: 'UPDATE_ACCOUNT_SETTINGS',
    validate
})(Account)
