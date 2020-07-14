// @flow
import React from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {Link, withRouter} from 'react-router'
import _capitalize from 'lodash/capitalize'
import classnames from 'classnames'
import {Container, Form, Button, Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS} from '../../../../../../constants/integration'
import {getRedirectUri} from '../../../../../../state/integrations/selectors'
import {displayRestrictedSymbols} from '../../../../../../utils'
import {notify} from '../../../../../../state/notifications/actions'

import InputField from '../../../../../common/forms/InputField'

import PageHeader from '../../../../../common/components/PageHeader'

import css from './EmailIntegrationCreateCustom.less'

type Props = {
    domain: string,
    actions: Object,
    loading: Object,
    location: Object,
    notify: (Object) => Promise<*>,
}

type State = {
    name: string,
    email: string,
    errors: Object,
    dirty: boolean,
}

export class EmailIntegrationCreateCustom extends React.Component<
    Props,
    State
> {
    state = {
        name: '',
        email: '',
        errors: {},
        dirty: false,
    }

    _handleSubmit = (event: SyntheticEvent<HTMLInputElement>) => {
        event.preventDefault()

        const integration = fromJS({
            type: 'email',
            name: this.state.name,
            meta: {
                address: this.state.email,
                preferred: false,
            },
        })

        const {updateOrCreateIntegration} = this.props.actions

        return updateOrCreateIntegration(integration).then((res) => {
            this.setState({dirty: false})
            return res
        })
    }

    _setName = (name: string) => {
        const {errors} = this.state
        const invalidNameRegexp = new RegExp(
            `[${EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS.join('')}]`
        )

        if (name && invalidNameRegexp.test(name)) {
            errors.name =
                'The name of your Email integration cannot contain these characters: ' +
                displayRestrictedSymbols(EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS)
        } else {
            errors.name = null
        }

        this.setState({
            dirty: true,
            name,
            errors,
        })
    }

    render() {
        const {domain, loading} = this.props
        const {errors} = this.state

        const nameHelp =
            'The name that customers will see when they receive emails from you. ' +
            `Cannot contain these characters: ${displayRestrictedSymbols(
                EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS
            )}`

        const hasErrors = Object.values(errors).some((val) => val != null)

        const isSubmitting = loading.get('updateIntegration')

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    Integrations
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations/email">
                                    Email
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                Add an email address
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <Container fluid className="page-container">
                    <p>
                        You can connect your email to Gorgias by setting up
                        email forwarding. Follow the steps below to get started.
                    </p>

                    <div className={css.form}>
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
                                onChange={(value) =>
                                    this.setState({email: value})
                                }
                            />

                            <div>
                                <Button
                                    type="submit"
                                    block
                                    color="success"
                                    className={classnames({
                                        'btn-loading': isSubmitting,
                                    })}
                                    disabled={
                                        !this.state.dirty ||
                                        isSubmitting ||
                                        hasErrors
                                    }
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

const mapStateToProps = (state) => ({
    domain: state.currentAccount.get('domain'),
    outlookRedirectUri: getRedirectUri('outlook')(state),
})

export default withRouter(
    connect(mapStateToProps, {notify})(EmailIntegrationCreateCustom)
)
