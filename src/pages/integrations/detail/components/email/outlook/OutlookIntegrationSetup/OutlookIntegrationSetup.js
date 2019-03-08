// @flow
import React from 'react'
import {connect} from 'react-redux'
import {Link, browserHistory} from 'react-router'
import classnames from 'classnames'
import {fromJS, type List, type Map} from 'immutable'

import {
    Form,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Container,
} from 'reactstrap'

import {OUTLOOK_INTEGRATION_TYPE} from '../../../../../../../constants/integration'

import Loader from '../../../../../../common/components/Loader'
import ToggleButton from '../../../../../../common/components/ToggleButton'
import PageHeader from '../../../../../../common/components/PageHeader'
import Pagination from '../../../../../../common/components/Pagination'

import * as integrationsSelectors from '../../../../../../../state/integrations/selectors'


type Props = {
    integrations: List<Map<*,*>>,
    pagination: Object,
    actions: Object,
    loading: Object,
}

type State = {
    selectedIntegrations: List<Map<*,*>>,
    isLoading: boolean
}


@connect((state) => {
    return {
        integrations: integrationsSelectors.getOnboardingIntegrations(OUTLOOK_INTEGRATION_TYPE)(state),
        pagination: integrationsSelectors.getOnboardingMeta(OUTLOOK_INTEGRATION_TYPE)(state)
    }
})
export default class OutlookIntegrationSetup extends React.Component<Props, State> {
    state = {
        selectedIntegrations: fromJS({}),
        isLoading: false
    }

    fetchInterval = null

    componentWillMount() {
        this._fetchPage(this.props.pagination.get('page') || 1)

        this.fetchInterval = setInterval(
            () => this._fetchPage(this.props.pagination.get('page') || 1),
            3000
        )
    }

    componentWillUnmount() {
        if (this.fetchInterval) {
            clearInterval(this.fetchInterval)
        }
    }

    _activateSelectedIntegrations = (evt: Event) => {
        evt.preventDefault()
        const {actions} = this.props
        const {selectedIntegrations} = this.state

        const data = selectedIntegrations
            .map((integration) => fromJS(integration).set('deleted_datetime', null))
            .toList().toJS()

        actions.activateOnboardingIntegrations(data, OUTLOOK_INTEGRATION_TYPE).then(() => actions.fetchIntegrations())
        browserHistory.push('/app/settings/integrations/email')
    }

    _toggleIntegration = (integration: Map<*,*>, enable: boolean) => {
        let {selectedIntegrations} = this.state
        const id = integration.get('id')

        if (enable) {
            selectedIntegrations = selectedIntegrations.set(id, integration)
        } else {
            selectedIntegrations = selectedIntegrations.delete(id)
        }

        this.setState({selectedIntegrations})
    }

    _fetchPage = (page: number, silent: boolean = true) => {
        if (!silent) {
            this.setState({isLoading: true})
        }

        this.props.actions.fetchOutlookOnboardingIntegrations(page, !silent).then(() => {
            if (!silent) {
                this.setState({isLoading: false})
            }
        })
    }

    render() {
        const {integrations, pagination, loading} = this.props
        const {selectedIntegrations, isLoading} = this.state

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
                            Outlook setup
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <Container
                    fluid
                    className="page-container"
                >
                    <h1>Outlook email addresses setup</h1>
                    <p>One last step: choose the email addresses you want to manage with Gorgias.</p>

                    <Form onSubmit={this._activateSelectedIntegrations}>
                        {
                            integrations.isEmpty() ? null : (
                                <div className="mb-4">
                                    <p className="font-weight-medium">
                                        We found {pagination.get('item_count')} email addresses associated with{' '}
                                        your account. Please activate the ones you want to connect to Gorgias:
                                    </p>
                                    <div className="mb-2">
                                        {
                                            isLoading ? <Loader/> : integrations.map((integration) => {
                                                const id = integration.get('id')
                                                const integrationEnabled = selectedIntegrations.has(id)
                                                const address = integration.getIn(['meta', 'address'])

                                                return (
                                                    <div key={id}>
                                                        <div className="d-flex flex-wrap flex-md-nowrap mb-2">
                                                            <div className="mr-auto">
                                                                <b className="mr-2">{integration.get('name')}</b>
                                                                <span className="text-faded">{address}</span>
                                                            </div>
                                                            <ToggleButton
                                                                value={integrationEnabled}
                                                                onChange={(value) => {
                                                                    this._toggleIntegration(integration, value)
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                    <Pagination
                                        onChange={(page) => this._fetchPage(page, false)}
                                        pageCount={pagination.get('nb_pages')}
                                        currentPage={pagination.get('page')}
                                    />
                                </div>
                            )
                        }

                        <div>
                            <Button
                                type="submit"
                                color="success"
                                disabled={selectedIntegrations.isEmpty()}
                                className={classnames({
                                    'btn-loading': loading.get('updateIntegration'),
                                })}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </Form>
                </Container>
            </div>
        )
    }
}
