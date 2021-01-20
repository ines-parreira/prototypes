import {fromJS} from 'immutable'
import classnames from 'classnames'
import React, {FormEvent, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Breadcrumb, BreadcrumbItem, Button, Container, Form} from 'reactstrap'
import {Link} from 'react-router-dom'
import {bindActionCreators} from 'redux'

import InputField from '../../../common/forms/InputField.js'
import PageHeader from '../../../common/components/PageHeader'
import {ZENDESK_IMPORTED_TICKETS_FOR_YEARS} from '../../../../config'
import {createImportIntegration} from '../../../../state/integrations/actions'
import * as utils from '../../../../utils'
import {RootState, StoreDispatch} from '../../../../state/types'
import {getIntegrationsByTypes} from '../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../models/integration/types'

import {ZENDESK_CONNECTION_TYPE} from './types'

export const ImportZendeskCreate = (
    props: ConnectedProps<typeof connector>
) => {
    const {createIntegration, integrations} = props
    const [domain, setDomain] = useState('')
    const [apiKey, setApiKey] = useState('')
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = (event: FormEvent) => {
        setIsLoading(true)
        event.preventDefault()
        const processedDomain = utils.subdomain(domain)

        const integration = fromJS({
            name: processedDomain,
            type: IntegrationType.ZendeskIntegrationType,
            connections: [
                {
                    type: ZENDESK_CONNECTION_TYPE,
                    data: {
                        domain: processedDomain,
                        email: email,
                        api_key: apiKey,
                    },
                },
            ],
            deactivated_datetime: new Date().toISOString(),
        })

        return Promise.resolve(createIntegration(integration)).then(() => {
            setIsLoading(false)
        })
    }

    const isExistingDomain =
        integrations.filter(
            (integration: Map<any, any>) => domain === integration.get('name')
        ).size > 0

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
                        <BreadcrumbItem active>Zendesk import</BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <Container fluid className="page-container">
                <p>
                    Gorgias will import tickets (one way) up to{' '}
                    {ZENDESK_IMPORTED_TICKETS_FOR_YEARS} years of history from
                    your Zendesk account.
                    <br />
                    Note: The import is performed one time only it will not sync
                    your tickets continuously.
                </p>

                <Form onSubmit={onSubmit}>
                    <InputField
                        type="text"
                        name="domain"
                        label="Zendesk subdomain"
                        placeholder={'ex: "acme" for acme.zendesk.com'}
                        onChange={(value: string) => setDomain(value)}
                        required
                        rightAddon=".zendesk.com"
                        error={
                            domain && isExistingDomain
                                ? 'This domain was already imported.'
                                : null
                        }
                    />
                    <InputField
                        type="text"
                        name="email"
                        label="Login email"
                        placeholder="The email address you use to login on your Zendesk"
                        onChange={(value: string) => setEmail(value)}
                        required
                    />
                    <InputField
                        type="text"
                        name="apiKey"
                        label="API Key"
                        placeholder=""
                        onChange={(value: string) => setApiKey(value)}
                        required
                        help="In your Zendesk, go to Settings > Channels > API, create a new token named Gorgias Import,
                        and copy/paste it in the field above."
                    />

                    <Button
                        type="submit"
                        color="success"
                        className={classnames({
                            'btn-loading': isLoading,
                        })}
                        disabled={isLoading || !domain || isExistingDomain}
                    >
                        Start import
                    </Button>
                </Form>
            </Container>
        </div>
    )
}

const mapStateToProps = (state: RootState) => {
    return {
        integrations: getIntegrationsByTypes(
            IntegrationType.ZendeskIntegrationType
        )(state),
    }
}
const mapDispatchToProps = (dispatch: StoreDispatch) => {
    return {
        createIntegration: bindActionCreators(
            createImportIntegration,
            dispatch
        ),
    }
}

const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(ImportZendeskCreate)
