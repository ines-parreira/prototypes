import React, {PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {Link, browserHistory, withRouter} from 'react-router'
import _capitalize from 'lodash/capitalize'
import classNames from 'classnames'
import {InputField} from '../../../../../common/forms'
import {
    Button,
    UncontrolledTooltip,
    Breadcrumb,
    BreadcrumbItem,
} from 'reactstrap'

import css from './EmailIntegrationCreate.less'
import formSender from '../../../../../common/utils/formSender'
import {logEvent} from '../../../../../../store/middlewares/amplitudeTracker'
import {notify} from '../../../../../../state/notifications/actions'

import googleLogo from './../../../../../../../../public/img/google-icon.svg'

class EmailIntegrationCreate extends React.Component {
    componentDidMount() {
        // display message from url
        const {
            message,
            message_type: type = 'info'
        } = this.props.location.query

        if (message) {
            this.props.notify({
                type,
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
            <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/integrations">Integrations</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to="/app/integrations/email">Email</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        Add
                    </BreadcrumbItem>
                </Breadcrumb>

                <h1>
                    Add email address
                </h1>

                <form
                    className={`ui form ${css.form}`}
                    onSubmit={handleSubmit((values) => this._handleSubmit('email', values))}
                >
                    <p>Choose the type of email account you want to add.</p>
                    <br />
                    <Button
                        tag="a"
                        href="/integrations/gmail/auth"
                        block
                        onClick={() => {
                            logEvent('connect_gmail_account_click')
                        }}
                        className={css.gmailButton}
                    >
                        <img src={googleLogo} style={{height: '100%'}}/>
                        <p>Connect Google email account</p>
                    </Button>

                    <p className="text-muted text-center">
                        Improve email deliverability, keep your data on your Google account, import last 100 emails (optional)
                    </p>
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
                                <i
                                    id="address-name"
                                    className="help circle link icon"
                                />
                                <UncontrolledTooltip
                                    placement="top"
                                    target="address-name"
                                    delay={0}
                                >
                                    The name that customers will see when they receive emails from you
                                </UncontrolledTooltip>
                            </span>
                        }
                        required
                    />
                    <Field
                        type="email"
                        name="meta.address"
                        label="Email address"
                        placeholder={`support@${domain}.com`}
                        component={InputField}
                        required
                    />
                    <Button
                        type="submit"
                        block
                        color="primary"
                        className={classNames({
                            'btn-loading': isSubmitting,
                        })}
                        disabled={isSubmitting}
                    >
                        Connect this email account
                    </Button>
                </form>
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
    location: PropTypes.object.isRequired,
    notify: PropTypes.func.isRequired,
}

const emailIntegrationCreateComponent = reduxForm({
    form: 'ADD_EMAIL_INTEGRATION',
})(EmailIntegrationCreate)

const mapStateToProps = state => ({
    domain: state.currentAccount.get('domain'),
})

export default withRouter(connect(mapStateToProps, {notify})(emailIntegrationCreateComponent))
