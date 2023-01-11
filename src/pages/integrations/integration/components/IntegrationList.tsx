import React, {ReactNode} from 'react'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {Breadcrumb, BreadcrumbItem, Container, Table} from 'reactstrap'
import moment from 'moment'
import {List, Map} from 'immutable'
import classnames from 'classnames'

import {isChannel} from 'config'
import Button from 'pages/common/components/button/Button'
import {getIntegrationConfig} from 'state/integrations/helpers'
import {notify} from 'state/notifications/actions'
import PageHeader from 'pages/common/components/PageHeader'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {IntegrationType} from 'models/integration/types'
import {NotificationStatus} from 'state/notifications/types'

import css from '../../../settings/settings.less'

import NoIntegration from './NoIntegration'

type Props = {
    integrationType: IntegrationType
    integrations: List<Map<any, any>>
    createIntegration: () => void
    createIntegrationButton?: ReactNode
    createIntegrationButtonLabel?: string
    longTypeDescription?: ReactNode
    loading: Map<any, any>
    alert?: ReactNode
    integrationToItemDisplay: (integration: Map<any, any>) => ReactNode
    createIntegrationButtonHidden: boolean
} & RouteComponentProps &
    ConnectedProps<typeof connector>
/**
 * A generic component to edit integrations of a given type.
 * We can then have specific components for each integration type using this one.
 */
class IntegrationList extends React.Component<Props> {
    static defaultProps: Pick<Props, 'createIntegrationButtonHidden'> = {
        createIntegrationButtonHidden: false,
    }

    onButtonClick = () => {
        if (this.props.integrationType === IntegrationType.SmoochInside) {
            void this.props.notify({
                status: NotificationStatus.Error,
                message:
                    'Cannot create a chat integration because it is deprecated. ' +
                    'Please use the new chat integration instead.',
            })
            return
        }

        this.props.createIntegration()
    }

    displayAircallWebhookWarning = (
        integrationType: IntegrationType,
        integrations: List<Map<any, any>>
    ) => {
        if (integrationType !== IntegrationType.Aircall) {
            return
        }

        const maxDate = moment('2021-05-20')

        const olderIntegrations = integrations.filter((integration) => {
            return moment(integration!.get('created_datetime')).isBefore(
                maxDate
            )
        })

        if (olderIntegrations.size > 0) {
            return (
                <Alert type={AlertType.Warning}>
                    Due to security reasons, we updated the webhook URL for
                    Aircall. Please update your integration by clicking ”Connect
                    Aircall”.
                </Alert>
            )
        }
    }

    render() {
        const {
            integrations,
            integrationType,
            createIntegrationButton,
            createIntegrationButtonLabel,
            longTypeDescription,
            integrationToItemDisplay,
            loading,
            alert,
        } = this.props

        const config = getIntegrationConfig(integrationType)

        return (
            <div className="w-100">
                <PageHeader
                    title={
                        <Breadcrumb>
                            {isChannel(config?.type) ||
                            config?.type === IntegrationType.Http ? null : (
                                <BreadcrumbItem>
                                    <Link to="/app/settings/integrations">
                                        All Apps
                                    </Link>
                                </BreadcrumbItem>
                            )}
                            <BreadcrumbItem active>
                                {config?.title}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                >
                    {!this.props.createIntegrationButtonHidden &&
                        createIntegrationButtonLabel && (
                            <Button type="submit" onClick={this.onButtonClick}>
                                {createIntegrationButtonLabel}
                            </Button>
                        )}
                    {!this.props.createIntegrationButtonHidden &&
                        React.isValidElement(createIntegrationButton) && (
                            <>
                                {React.cloneElement(createIntegrationButton, {
                                    ...createIntegrationButton.props,
                                    onClick: this.onButtonClick,
                                })}
                            </>
                        )}
                </PageHeader>

                <Container
                    fluid
                    className={classnames(css.pageContainer, css.pb0)}
                    data-candu-id="integration-list-top"
                >
                    <div className="mb-3">{longTypeDescription}</div>
                    {alert}
                    {this.displayAircallWebhookWarning(
                        integrationType,
                        integrations
                    )}

                    {integrations.isEmpty() && (
                        <div className="mt-3">
                            <NoIntegration
                                loading={loading.get('integrations', false)}
                            />
                        </div>
                    )}
                </Container>

                {!integrations.isEmpty() && (
                    <Table className="table-integrations mt-3" hover>
                        <tbody>
                            {integrations
                                .valueSeq()
                                .map((integration) =>
                                    integrationToItemDisplay(integration!)
                                )}
                        </tbody>
                    </Table>
                )}

                <Container fluid data-candu-id="integration-list-bottom" />
            </div>
        )
    }
}

const connector = connect(null, {
    notify,
})

export default withRouter(connector(IntegrationList))
