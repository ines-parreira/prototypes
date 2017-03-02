import React, {PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {InputField} from '../../../../../common/components/formFields'
import css from './EmailIntegrationCreate.less'
import {fromJS} from 'immutable'
import formSender from '../../../../../common/utils/formSender'
import _capitalize from 'lodash/capitalize'
import classNames from 'classnames'
import {browserHistory} from 'react-router'
import {getQueryParam} from '../../../../../../utils'
import {logEvent} from '../../../../../../store/middlewares/amplitudeTracker'
import {notify} from '../../../../../../state/notifications/actions'
import googleIcon from './google-icon.png'


class EmailIntegrationCreate extends React.Component {
    componentDidMount() {
        $(this.refs.AddressNameTooltip).popup({
            inline: true,
            position: 'top left',
            offset: -11
        })

        // display message from url
        const message = getQueryParam('message')
        if (message) {
            this.props.notify({
                type: getQueryParam('message_type') || 'info',
                title: message.replace(/\+/g, ' ')
            })
            // remove error from url
            browserHistory.push(window.location.pathname)
        }
    }

    _handleSubmit = (type, values) => {
        const {updateOrCreateIntegration} = this.props.actions
        const integration = fromJS({
            type,
            name: values.name,
            meta: {
                address: values.meta.address,
                preferred: false
            }
        })

        logEvent('connect_standard_email_account_click')
        return formSender(updateOrCreateIntegration(integration))
    }

    render() {
        const {
            domain,
            loading,
            handleSubmit,
        } = this.props
        const isSubmitting = loading.get('updateIntegration')

        return (
            <div className="ui grid">
                <div className="sixteen wide tablet ten wide computer column">
                    <div className="ui large breadcrumb">
                        <Link to="/app/integrations">Integrations</Link>
                        <i className="right angle icon divider"/>
                        <Link to="/app/integrations/email" className="section">Email</Link>
                        <i className="right angle icon divider"/>
                        <a className="active section">
                            Add email address
                        </a>
                    </div>
                    <h1 className="ui header">
                        Add email address
                    </h1>
                </div>

                <div className="ui row pt0i">
                    <div className="sixteen wide tablet seven wide computer column">
                        <form
                            className={`ui form ${css.form}`}
                            onSubmit={handleSubmit((values) => this._handleSubmit('email', values))}
                        >
                            <p>Choose the type of email account you want to add.</p>
                            <br/>
                            <a
                                href="/integrations/gmail/auth"
                                className="fluid ui google plus icon submit button"
                                onClick={() => { logEvent('connect_gmail_account_click') }}
                            >
                                <img
                                    className={css['gmail-icon']}
                                    width="20" height="20"
                                    src={googleIcon}
                                    alt="gmail-icon"
                                />
                                Connect your google account
                            </a>
                            <div className="ui horizontal divider mt20i mb15i">
                                OR
                            </div>
                            <Field
                                type="text"
                                name="name"
                                placeholder={`${_capitalize(domain)} Support`}
                                component={InputField}
                                label={
                                    <span>
                                        Address name
                                        <span
                                            ref="AddressNameTooltip"
                                            className="inverted tooltip"
                                            data-content="The name that customers will see when they receive emails from you."
                                            data-variation="inverted"
                                        >
                                            <i className="help circle link icon"/>
                                        </span>
                                    </span>
                                }
                            />
                            <Field
                                type="email"
                                name="meta.address"
                                label="Email address"
                                placeholder={`support@${domain}.com`}
                                component={InputField}
                            />
                            <button
                                disabled={isSubmitting}
                                className={classNames('fluid ui primary submit button', {
                                    loading: isSubmitting
                                })}
                            >
                                Connect this email account
                            </button>

                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

EmailIntegrationCreate.propTypes = {
    domain: PropTypes.string.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    pristine: PropTypes.bool.isRequired,
    loading: PropTypes.object.isRequired,
    notify: PropTypes.func.isRequired,
}

const emailIntegrationCreateComponent = reduxForm({
    form: 'ADD_EMAIL_INTEGRATION',
})(EmailIntegrationCreate)

const mapStateToProps = state => ({
    domain: state.currentAccount.get('domain'),
})

export default connect(mapStateToProps, {notify})(emailIntegrationCreateComponent)
