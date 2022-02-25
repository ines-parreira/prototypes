import {fromJS} from 'immutable'
import React, {FormEvent, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Breadcrumb, BreadcrumbItem, Container, Form} from 'reactstrap'
import {Link} from 'react-router-dom'
import {bindActionCreators} from 'redux'

import InputField from 'pages/common/forms/InputField'
import PageHeader from 'pages/common/components/PageHeader'
import {ZENDESK_IMPORTED_TICKETS_FOR_YEARS} from 'config'
import {createImportIntegration} from 'state/integrations/actions'
import * as utils from 'utils'
import {RootState, StoreDispatch} from 'state/types'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/types'
import Tooltip from 'pages/common/components/Tooltip'
import css from 'pages/settings/settings.less'
import Button from 'pages/common/components/button/Button'

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
            type: IntegrationType.Zendesk,
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

            <Container fluid className={css.pageContainer}>
                <div className="col-sm-13 col-md-9 col-lg-6 pl-0 mb-5">
                    <b>Let's connect your account to Gorgias.</b>
                    <br />
                    We'll import your up to {
                        ZENDESK_IMPORTED_TICKETS_FOR_YEARS
                    }{' '}
                    years of Zendesk's history, customers, macros & tags. Once
                    the initial import is successful, the data from your Zendesk
                    account will be synchronizing automatically.
                </div>

                <Form
                    onSubmit={onSubmit}
                    className="col-sm-12 col-md-7 col-lg-4 pl-0"
                >
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
                        className="mb-4"
                        type="text"
                        name="apiKey"
                        label={
                            <span>
                                API Key{' '}
                                <i className="material-icons" id="api-key-info">
                                    info_outline
                                </i>
                            </span>
                        }
                        placeholder=""
                        onChange={(value: string) => setApiKey(value)}
                        required
                    />

                    <Tooltip placement="top-start" target="api-key-info">
                        In Zendesk, go to Settings / Channels / API, create a
                        new token named "Gorgias Import", and copy/paste it
                        here.
                    </Tooltip>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        isDisabled={isLoading || !domain || isExistingDomain}
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
        integrations: getIntegrationsByTypes(IntegrationType.Zendesk)(state),
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
