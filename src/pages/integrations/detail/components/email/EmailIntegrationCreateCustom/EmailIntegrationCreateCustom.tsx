import React, {Component, SyntheticEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'
import {Link} from 'react-router-dom'
import _capitalize from 'lodash/capitalize'
import classnames from 'classnames'
import {Container, Form, Button, Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS} from '../../../../../../constants/integration'
import {displayRestrictedSymbols} from '../../../../../../utils'
import {notify} from '../../../../../../state/notifications/actions'
import InputField from '../../../../../common/forms/InputField.js'
import PageHeader from '../../../../../common/components/PageHeader'
import {RootState} from '../../../../../../state/types'
import {updateOrCreateIntegration} from '../../../../../../state/integrations/actions'

import css from './EmailIntegrationCreateCustom.less'

type Props = {
    loading: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    name: string
    email: string
    errors: {name?: string | null}
    dirty: boolean
}

export class EmailIntegrationCreateCustom extends Component<Props, State> {
    state: State = {
        name: '',
        email: '',
        errors: {},
        dirty: false,
    }

    _handleSubmit = (event: SyntheticEvent) => {
        event.preventDefault()

        const integration = fromJS({
            type: 'email',
            name: this.state.name,
            meta: {
                address: this.state.email,
                preferred: false,
            },
        })

        const {updateOrCreateIntegration} = this.props

        return (updateOrCreateIntegration(integration) as Promise<void>).then(
            () => {
                this.setState({dirty: false})
            }
        )
    }

    _setName = (name: string) => {
        const {errors} = this.state
        const invalidNameRegexp = new RegExp(
            `[${EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS.join('')}]`
        )

        if (name && invalidNameRegexp.test(name)) {
            errors.name =
                'The name of your Email integration cannot contain these characters: ' +
                displayRestrictedSymbols(
                    EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS as string[]
                )
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
                EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS as string[]
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

const connector = connect(
    (state: RootState) => ({
        domain: state.currentAccount.get('domain') as string,
    }),
    {notify, updateOrCreateIntegration}
)

export default connector(EmailIntegrationCreateCustom)
