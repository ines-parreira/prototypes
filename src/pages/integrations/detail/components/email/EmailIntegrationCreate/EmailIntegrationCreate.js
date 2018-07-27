import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {Link, browserHistory, withRouter} from 'react-router'
import _capitalize from 'lodash/capitalize'
import classnames from 'classnames'
import {
    Container,
    Form,
    Button,
    Breadcrumb,
    BreadcrumbItem,
} from 'reactstrap'

import css from './EmailIntegrationCreate.less'
import {notify} from '../../../../../../state/notifications/actions'

import InputField from '../../../../../common/forms/InputField'

import googleLogo from './../../../../../../../../public/img/google-icon.svg'
import PageHeader from '../../../../../common/components/PageHeader'

class EmailIntegrationCreate extends React.Component {
    componentDidMount() {
        // display message from url
        const {
            message,
            message_type: status = 'info'
        } = this.props.location.query

        if (message) {
            this.props.notify({
                status,
                title: message.replace(/\+/g, ' ')
            })
            // remove error from url
            browserHistory.push(window.location.pathname)
        }
    }

    state = {
        name: '',
        email: '',
        errors: {},
        dirty: false
    }

    _handleSubmit = (e) => {
        e.preventDefault()

        const integration = fromJS({
            type: 'email',
            name: this.state.name,
            meta: {
                address: this.state.email,
                preferred: false
            }
        })

        const {updateOrCreateIntegration} = this.props.actions

        return updateOrCreateIntegration(integration)
            .then((res) => {
                this.setState({dirty: false})
                return res
            })
    }

    _setName = (name) => {
        const {errors} = this.state

        if (name && /[@]+/.test(name)) {
            errors.name = 'The name of your Email integration cannot contain a "@".'
        } else {
            errors.name = null
        }

        this.setState({
            dirty: true,
            name,
            errors
        })

    }

    render() {
        const {
            domain,
            loading,
        } = this.props

        const {errors} = this.state

        const nameHelp = 'The name that customers will see when they receive emails from you. Cannot contain a "@".'

        const hasErrors = Object.values(errors).some((val) => val != null)

        const isSubmitting = loading.get('updateIntegration')

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/email">Email</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Add an email address
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <Container fluid className="page-container">
                    <p>Choose the type of email account you want to add.</p>

                    <div className={css.form}>
                        <Button
                            tag="a"
                            href="/integrations/gmail/auth"
                            block
                            className={classnames('mb-2', css.gmailButton)}
                        >
                            <img src={googleLogo} style={{height: '100%'}} />
                            <div>Connect Google email account</div>
                        </Button>

                        <p className="text-muted text-center">
                            Improve email deliverability, keep your data on your Google account, import last 100 emails
                            (optional)
                        </p>

                        <div className="divider">OR</div>

                        <Form onSubmit={this._handleSubmit}>
                            <InputField
                                type="text"
                                name="name"
                                label="Address name"
                                placeholder={`${_capitalize(domain)} Support`}
                                required
                                help={nameHelp}
                                value={this.state.name}
                                onChange={(name) => this._setName(name)}
                                error={errors.name}
                            />
                            <InputField
                                type="email"
                                name="meta.address"
                                label="Email address"
                                placeholder={`support@${domain}.com`}
                                required
                                value={this.state.email}
                                onChange={(value) => this.setState({email: value})}
                            />

                            <div>
                                <Button
                                    type="submit"
                                    block
                                    color="success"
                                    className={classnames({
                                        'btn-loading': isSubmitting,
                                    })}
                                    disabled={!this.state.dirty || isSubmitting || hasErrors}
                                >
                                    Connect this email account
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Container>
            </div>
        )
    }
}


EmailIntegrationCreate.propTypes = {
    domain: PropTypes.string.isRequired,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    notify: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
    domain: state.currentAccount.get('domain'),
})

export default withRouter(connect(mapStateToProps, {notify})(EmailIntegrationCreate))
