import React, {FormEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Breadcrumb, BreadcrumbItem, Button, Container} from 'reactstrap'
import {Link} from 'react-router'

import Form from 'reactstrap/lib/Form'

import InputField from '../../../common/forms/InputField.js'
import PageHeader from '../../../common/components/PageHeader'
import {ZENDESK_IMPORTED_TICKETS_FOR_YEARS} from '../../../../config'
import {
    getIntegrationsByTypes,
    getRedirectUri,
} from '../../../../state/integrations/selectors'
import {RootState} from '../../../../state/types'
import {IntegrationType} from '../../../../models/integration/types'

export type State = {
    domain: string
    isDomainValid: boolean
}

export class ImportZendeskDetail extends React.Component<
    ConnectedProps<typeof connector>,
    State
> {
    constructor(props: ConnectedProps<typeof connector>) {
        super(props)
        this.state = {
            domain: '',
            isDomainValid: false,
        }
    }

    _isExistingDomain = (value: string) => {
        const {integrations} = this.props
        return (
            integrations.filter(
                (integration: Map<any, any>) =>
                    value === integration.get('name')
            ).size > 0
        )
    }

    handleUpdateDomain = (value: string) => {
        const isDomainValid = value.length > 0 && !this._isExistingDomain(value)
        this.setState({domain: value, isDomainValid: isDomainValid})
    }

    _onSubmit = (event: FormEvent) => {
        event.preventDefault()
        const {domain} = this.state
        const {zendeskRedirectUri} = this.props

        window.location.assign(`${zendeskRedirectUri}?domain=${domain}`)
    }

    render() {
        const {domain, isDomainValid} = this.state

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/import-data">
                                    Import data
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                Zendesk import
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <Container fluid className="page-container">
                    <p>
                        Gorgias will import tickets (one way) up to{' '}
                        {ZENDESK_IMPORTED_TICKETS_FOR_YEARS} years of history
                        from your Zendesk account.
                        <br />
                        Note: The import is performed one time only it will not
                        sync your tickets continuously.
                    </p>
                    <Form onSubmit={this._onSubmit}>
                        <InputField
                            error={
                                !isDomainValid && domain
                                    ? 'This domain was already imported.'
                                    : null
                            }
                            type="text"
                            name="domain"
                            label="Zendesk subdomain"
                            placeholder={'ex: "acme" for acme.zendesk.com'}
                            onChange={this.handleUpdateDomain}
                            required
                            rightAddon=".zendesk.com"
                        />

                        <Button
                            type="submit"
                            color="success"
                            disabled={!isDomainValid}
                        >
                            Add domain
                        </Button>
                    </Form>
                </Container>
            </div>
        )
    }
}

const mapStateToProps = (state: RootState) => {
    return {
        zendeskRedirectUri: getRedirectUri(
            IntegrationType.ZendeskIntegrationType
        )(state),
        integrations: getIntegrationsByTypes(
            IntegrationType.ZendeskIntegrationType
        )(state),
    }
}

const connector = connect(mapStateToProps, {})
export default connector(ImportZendeskDetail)
