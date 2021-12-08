import React, {ReactNode} from 'react'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {Breadcrumb, BreadcrumbItem, Button, Container, Table} from 'reactstrap'
import {parse} from 'query-string'
import moment from 'moment'
import {List, Map} from 'immutable'
import classnames from 'classnames'

import {getIntegrationConfig} from '../../../../state/integrations/helpers'
import {notify} from '../../../../state/notifications/actions'
import PageHeader from '../../../common/components/PageHeader'
import Alert, {AlertType} from '../../../common/components/Alert/Alert'

import {IntegrationType} from '../../../../models/integration/types'
import {NotificationStatus} from '../../../../state/notifications/types'
import css from '../../../settings/settings.less'

import NoIntegration from './NoIntegration.js'

type Props = {
    integrationType: IntegrationType
    integrations: List<Map<any, any>>
    createIntegration: () => void
    createIntegrationButtonClassName?: string
    createIntegrationButtonContent: ReactNode
    createIntegrationButtonOnClick?: () => void
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

        if (this.props.createIntegrationButtonOnClick) {
            this.props.createIntegrationButtonOnClick()
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

    componentWillMount() {
        if (parse(this.props.location.search).status === 'create-error') {
            void this.props.notify({
                status: NotificationStatus.Error,
                message: `Something went wrong while creating your integration. Please wait a few minutes and ' +
                    'try again. If the problem persists, contact us at ${window.GORGIAS_SUPPORT_EMAIL}.`,
            })
        }
    }

    render() {
        const {
            integrations,
            integrationType,
            createIntegrationButtonContent,
            createIntegrationButtonClassName,
            longTypeDescription,
            integrationToItemDisplay,
            loading,
            alert,
        } = this.props

        const integrationTitle = getIntegrationConfig(integrationType)!.title

        return (
            <div className="w-100">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    Integrations
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                {integrationTitle}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                >
                    {!this.props.createIntegrationButtonHidden && (
                        <Button
                            type="submit"
                            color="success"
                            onClick={this.onButtonClick}
                            className={createIntegrationButtonClassName}
                        >
                            {createIntegrationButtonContent}
                        </Button>
                    )}
                </PageHeader>

                <Container
                    fluid
                    className={classnames(css.pageContainer, css.pb0)}
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
                                type={integrationType}
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
            </div>
        )
    }
}

const connector = connect(null, {
    notify,
})

export default withRouter(connector(IntegrationList))
