// @flow
import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {fromJS, type List, type Map} from 'immutable'
import {Breadcrumb, BreadcrumbItem, Button, Container, Form} from 'reactstrap'

import {OUTLOOK_INTEGRATION_TYPE} from '../../../../../../../constants/integration.ts'
import Loader from '../../../../../../common/components/Loader/Loader.tsx'
import ToggleButton from '../../../../../../common/components/ToggleButton.tsx'
import PageHeader from '../../../../../../common/components/PageHeader.tsx'
import Pagination from '../../../../../../common/components/Pagination.tsx'
import Search from '../../../../../../common/components/Search.tsx'
import * as integrationsSelectors from '../../../../../../../state/integrations/selectors.ts'
import history from '../../../../../../history.ts'

type Props = {
    integrations: List<Map<*, *>>,
    pagination: Object,
    actions: Object,
    loading: Object,
}

type State = {
    selectedIntegrations: List<Map<*, *>>,
    isLoading: boolean,
    filter: string,
}

export class OutlookIntegrationSetupContainer extends React.Component<
    Props,
    State
> {
    state = {
        selectedIntegrations: fromJS({}),
        isLoading: false,
        filter: '',
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
            .map((integration) =>
                fromJS(integration).set('deleted_datetime', null)
            )
            .toList()
            .toJS()

        actions
            .activateOnboardingIntegrations(data, OUTLOOK_INTEGRATION_TYPE)
            .then(() => actions.fetchIntegrations())
        history.push('/app/settings/integrations/email')
    }

    _toggleIntegration = (integration: Map<*, *>, enable: boolean) => {
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
        const {filter} = this.state

        if (!silent) {
            this.setState({isLoading: true})
        }

        this.props.actions
            .fetchOutlookOnboardingIntegrations(page, !silent, filter)
            .then(() => {
                if (!silent) {
                    this.setState({isLoading: false})
                }
            })
    }

    _onSearch = (filter: string) => {
        this.setState({filter})
        this._fetchPage(1, false)
    }

    _renderResultsMessage() {
        const {pagination} = this.props
        const {filter} = this.state
        let message

        switch (pagination.get('item_count')) {
            case 0:
                message = filter
                    ? 'No results matching your current search filter.'
                    : 'We did not find any email address associated with your account.'
                break
            case 1:
                message = filter
                    ? 'We found one email address matching your current search filter. '
                    : 'We found one email address associated with your account. '

                message += 'Please activate it to connect it to Gorgias:'
                break
            default:
                message = filter
                    ? `We found ${pagination.get(
                          'item_count'
                      )} email addresses matching your current search filter. `
                    : `We found ${pagination.get(
                          'item_count'
                      )} email addresses associated with your account. `

                message +=
                    'Please activate the ones you want to connect to Gorgias:'
                break
        }

        return <p className="font-weight-medium">{message}</p>
    }

    render() {
        const {integrations, pagination, loading} = this.props
        const {selectedIntegrations, isLoading} = this.state

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
                                Outlook setup
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                >
                    <Search
                        bindKey
                        onChange={this._onSearch}
                        placeholder="Search addresses..."
                        searchDebounceTime={300}
                        className="mr-2"
                    />
                </PageHeader>

                <Container fluid className="page-container with-space-bottom">
                    <h1>Outlook email addresses setup</h1>
                    <p>
                        One last step: choose the email addresses you want to
                        manage with Gorgias.
                    </p>

                    <Form onSubmit={this._activateSelectedIntegrations}>
                        {this._renderResultsMessage()}
                        {integrations.isEmpty() ? null : (
                            <div className="mb-4">
                                <div className="mb-2">
                                    {isLoading ? (
                                        <Loader />
                                    ) : (
                                        integrations.map((integration) => {
                                            const id = integration.get('id')
                                            const integrationEnabled = selectedIntegrations.has(
                                                id
                                            )
                                            const address = integration.getIn([
                                                'meta',
                                                'address',
                                            ])

                                            return (
                                                <div key={id}>
                                                    <div className="d-flex flex-wrap flex-md-nowrap mb-2">
                                                        <div className="mr-auto">
                                                            <b className="mr-2">
                                                                {integration.get(
                                                                    'name'
                                                                )}
                                                            </b>
                                                            <span className="text-faded">
                                                                {address}
                                                            </span>
                                                        </div>
                                                        <ToggleButton
                                                            value={
                                                                integrationEnabled
                                                            }
                                                            onChange={(
                                                                value
                                                            ) => {
                                                                this._toggleIntegration(
                                                                    integration,
                                                                    value
                                                                )
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                                <Pagination
                                    onChange={(page) =>
                                        this._fetchPage(page, false)
                                    }
                                    pageCount={pagination.get('nb_pages')}
                                    currentPage={pagination.get('page')}
                                />
                            </div>
                        )}

                        <div>
                            <Button
                                type="submit"
                                color="success"
                                disabled={selectedIntegrations.isEmpty()}
                                className={classnames({
                                    'btn-loading': loading.get(
                                        'updateIntegration'
                                    ),
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

const connector = connect((state) => ({
    integrations: integrationsSelectors.getOnboardingIntegrations(
        OUTLOOK_INTEGRATION_TYPE
    )(state),
    pagination: integrationsSelectors.getOnboardingMeta(
        OUTLOOK_INTEGRATION_TYPE
    )(state),
}))

export default connector(OutlookIntegrationSetupContainer)
