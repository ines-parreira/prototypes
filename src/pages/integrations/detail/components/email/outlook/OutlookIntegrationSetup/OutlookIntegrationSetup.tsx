import React, {Component, FormEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {fromJS, List, Map} from 'immutable'
import {Breadcrumb, BreadcrumbItem, Button, Container, Form} from 'reactstrap'

import Loader from '../../../../../../common/components/Loader/Loader'
import ToggleInput from '../../../../../../common/forms/ToggleInput'
import PageHeader from '../../../../../../common/components/PageHeader'
import Pagination from '../../../../../../common/components/Pagination'
import Search from '../../../../../../common/components/Search'
import {
    getOnboardingIntegrations,
    getOnboardingMeta,
} from '../../../../../../../state/integrations/selectors'
import history from '../../../../../../history'
import {IntegrationType} from '../../../../../../../models/integration/types'
import {RootState} from '../../../../../../../state/types'
import {
    activateOnboardingIntegrations,
    fetchIntegrations,
    fetchOutlookOnboardingIntegrations,
} from '../../../../../../../state/integrations/actions'
import css from '../../../../../../settings/settings.less'

type Props = {
    loading: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    selectedIntegrations: List<Map<any, any>>
    isLoading: boolean
    filter: string
}

export class OutlookIntegrationSetupContainer extends Component<Props, State> {
    state: State = {
        selectedIntegrations: fromJS({}),
        isLoading: false,
        filter: '',
    }

    fetchInterval: number | null = null

    componentWillMount() {
        this._fetchPage(this.props.pagination.get('page') || 1)

        this.fetchInterval = window.setInterval(
            () => this._fetchPage(this.props.pagination.get('page') || 1),
            3000
        )
    }

    componentWillUnmount() {
        if (this.fetchInterval) {
            clearInterval(this.fetchInterval)
        }
    }

    _activateSelectedIntegrations = (evt: FormEvent) => {
        evt.preventDefault()
        const {activateOnboardingIntegrations, fetchIntegrations} = this.props
        const {selectedIntegrations} = this.state

        const data = selectedIntegrations
            .map((integration) =>
                (fromJS(integration) as Map<any, any>).set(
                    'deleted_datetime',
                    null
                )
            )
            .toList()
            .toJS()

        void activateOnboardingIntegrations(data, IntegrationType.Outlook).then(
            () => fetchIntegrations()
        )
        history.push('/app/settings/integrations/email')
    }

    _toggleIntegration = (integration: Map<any, any>, enable: boolean) => {
        let {selectedIntegrations} = this.state
        const id = integration.get('id')

        if (enable) {
            selectedIntegrations = selectedIntegrations.set(id, integration)
        } else {
            selectedIntegrations = selectedIntegrations.delete(id)
        }

        this.setState({selectedIntegrations})
    }

    _fetchPage = (page: number, silent = true) => {
        const {fetchOutlookOnboardingIntegrations} = this.props
        const {filter} = this.state

        if (!silent) {
            this.setState({isLoading: true})
        }

        void fetchOutlookOnboardingIntegrations(page, !silent, filter).then(
            () => {
                if (!silent) {
                    this.setState({isLoading: false})
                }
            }
        )
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
                    ? `We found ${
                          pagination.get('item_count') as number
                      } email addresses matching your current search filter. `
                    : `We found ${
                          pagination.get('item_count') as number
                      } email addresses associated with your account. `

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

                <Container
                    fluid
                    className={classnames(
                        'page-container with-space-bottom',
                        css.pageContainer
                    )}
                >
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
                                        integrations.map(
                                            (integration: Map<any, any>) => {
                                                const id = integration.get('id')
                                                const integrationEnabled =
                                                    selectedIntegrations.has(id)
                                                const address =
                                                    integration.getIn([
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
                                                            <ToggleInput
                                                                isToggled={
                                                                    integrationEnabled
                                                                }
                                                                onClick={(
                                                                    value: boolean
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
                                            }
                                        )
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
                                    'btn-loading':
                                        loading.get('updateIntegration'),
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

const connector = connect(
    (state: RootState) => ({
        integrations: getOnboardingIntegrations(IntegrationType.Outlook)(state),
        pagination: getOnboardingMeta(IntegrationType.Outlook)(state),
    }),
    {
        activateOnboardingIntegrations,
        fetchIntegrations,
        fetchOutlookOnboardingIntegrations,
    }
)

export default connector(OutlookIntegrationSetupContainer)
