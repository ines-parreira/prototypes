import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {Breadcrumb, BreadcrumbItem, Button, Container, Form} from 'reactstrap'

import InputField from '../../../common/forms/InputField'
import {ZENDESK_IMPORTED_TICKETS_FOR_YEARS} from '../../../../config'

import * as utils from '../../../../utils'
import PageHeader from '../../../common/components/PageHeader'

import * as integrationActions from './../../../../state/integrations/actions.ts'

@connect(null, {
    createIntegration: integrationActions.createImportIntegration,
})
export default class ImportZendeskDetail extends React.Component {
    static propTypes = {
        createIntegration: PropTypes.func.isRequired,
    }

    state = {
        domain: '',
        email: '',
        apiKey: '',
        isLoading: false,
    }

    _onSubmit = (e) => {
        e.preventDefault()
        this.setState({isLoading: true})

        const domain = utils.subdomain(this.state.domain)

        const integration = fromJS({
            name: domain,
            type: 'zendesk',
            connections: [
                {
                    type: 'zendesk_auth_data',
                    data: {
                        domain,
                        email: this.state.email,
                        api_key: this.state.apiKey,
                    },
                },
            ],
            deactivated_datetime: new Date().toISOString(),
        })

        return this.props.createIntegration(integration).then(() => {
            this.setState({isLoading: false})
        })
    }

    render() {
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
                            type="text"
                            name="domain"
                            label="Zendesk subdomain"
                            placeholder={'ex: "acme" for acme.zendesk.com'}
                            onChange={(value) => this.setState({domain: value})}
                            required
                            rightAddon=".zendesk.com"
                        />
                        <InputField
                            type="text"
                            name="email"
                            label="Login email"
                            placeholder="The email address you use to login on your Zendesk"
                            onChange={(value) => this.setState({email: value})}
                            required
                        />
                        <InputField
                            type="text"
                            name="apiKey"
                            label="API Key"
                            placeholder=""
                            onChange={(value) => this.setState({apiKey: value})}
                            required
                            help="In your Zendesk, go to Settings > Channels > API, create a new token named Gorgias Import,
                        and copy/paste it in the field above."
                        />

                        <Button
                            type="submit"
                            color="success"
                            className={classnames({
                                'btn-loading': this.state.isLoading,
                            })}
                            disabled={this.state.isLoading}
                        >
                            Start import
                        </Button>
                    </Form>
                </Container>
            </div>
        )
    }
}
