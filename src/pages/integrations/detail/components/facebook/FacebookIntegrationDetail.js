import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import _truncate from 'lodash/truncate'
import {
    Alert,
    FormGroup,
    Button,
    Popover,
    PopoverHeader,
    PopoverBody,
    Breadcrumb,
    BreadcrumbItem, Container,
} from 'reactstrap'

import Loader from '../../../../common/components/Loader'

import BooleanField from '../../../../common/forms/BooleanField'
import PageHeader from '../../../../common/components/PageHeader'
import ConfirmButton from '../../../../common/components/ConfirmButton'
import RealtimeMessagingIntegrationNavigation from '../../../common/RealtimeMessagingIntegrationNavigation'

import pageIconDefault from '../../../../../../img/integrations/facebook-page.png'

export default class FacebookIntegrationDetail extends React.Component {
    state = {
        settings: {
            posts_enabled: true,
            messenger_enabled: true,
            import_history_enabled: true,
        },
        askDisableConfirmation: false,
    }

    componentWillMount() {
        const settings = this.props.integration.getIn(['facebook', 'settings'], fromJS({}))

        if (!settings.isEmpty()) {
            this.setState({settings: settings.toJS()})
        }
    }

    componentWillReceiveProps(nextProps) {
        // set default state
        if (nextProps.integration && !nextProps.integration.isEmpty()
            && !nextProps.integration.equals(this.props.integration)) {
            this.setState({
                settings: nextProps.integration.getIn(['facebook', 'settings']).toJS()
            })
        }
    }

    _onChange = (value, name) => {
        this.state.settings[name] = value
        this.setState(this.state)
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        const {actions, integration} = this.props
        const settings = this.state.settings
        const updated = integration.mergeDeep({
            facebook: {
                settings
            }
        })
        actions.updateOrCreateIntegration(updated)
    }

    _disable = () => {
        this.setState({askDisableConfirmation: false})
        this.props.actions.deactivateIntegration(this.props.integration.get('id'))
        browserHistory.push('/app/settings/integrations/facebook')
    }

    _toggleDisableConfirmation = () => {
        this.setState({askDisableConfirmation: !this.state.askDisableConfirmation})
    }

    render() {
        const {integration, loading, actions} = this.props

        const page = integration.get('facebook') || fromJS({})
        const isDisabled = integration.get('deactivated_datetime')

        const integrationScope = integration.getIn(['meta', 'oauth', 'scope']) || fromJS([])
        const doesntHaveInstagramPermissions = !integrationScope.includes('instagram_basic')
            || !integrationScope.includes('instagram_manage_comments')
        const doesntHaveInstagramId = !integration.getIn(['meta', 'instagram', 'id'])

        let disabledInstagramComponent = null

        if (doesntHaveInstagramPermissions) {
            disabledInstagramComponent = (
                <Alert color="warning">
                    <i className="material-icons md-2 mr-2">
                        warning
                    </i>
                    Instagram is disabled because we miss the required permissions. Please go to the{' '}
                    <Link to="/app/settings/integrations/facebook">Facebook integrations list</Link> and click on{' '}
                    Login to Facebook to update your permissions.
                </Alert>
            )
        } else if (doesntHaveInstagramId) {
            disabledInstagramComponent = (
                <Alert color="warning">
                    You cannot activate Instagram on this page: it is not associated with any Instagram account.<br/>
                    If you just associated the page with an Instagram account, please go to the{' '}
                    <Link to="/app/settings/integrations/facebook">Facebook integrations list</Link> and click on{' '}
                    Login to Facebook to update your integrations.
                </Alert>
            )
        }

        if (loading.get('integration') || page.isEmpty()) {
            return <Loader />
        }

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/facebook">Facebook, Messenger & Instagram</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {page.get('name')}
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Overview
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <RealtimeMessagingIntegrationNavigation integration={integration}/>

                <Container fluid className="page-container">
                    <div className="d-flex align-items-center mb-3">
                        <img
                            className="image rounded mr-3"
                            width="30"
                            src={page.getIn(['picture', 'data', 'url'], pageIconDefault)}
                        />
                        <div className="text-truncate text-faded">
                            <h2 className="d-inline mr-3 text-info">
                                {page.get('name')}
                            </h2>
                            <span>
                                {_truncate(page.get('about'), {length: 100})}
                            </span>
                        </div>
                    </div>
                    <div className="d-md-flex">
                        <FormGroup className="mr-3">
                            <BooleanField
                                name="messenger_enabled"
                                type="checkbox"
                                label="Enable Messenger"
                                value={this.state.settings.messenger_enabled}
                                onChange={value => this._onChange(value, 'messenger_enabled')}
                            />
                            <BooleanField
                                name="posts_enabled"
                                type="checkbox"
                                label="Enable Facebook posts & comments"
                                value={this.state.settings.posts_enabled}
                                onChange={value => this._onChange(value, 'posts_enabled')}
                            />
                            <BooleanField
                                name="instagram_comments_enabled"
                                type="checkbox"
                                label="Enable Instagram comments"
                                value={this.state.settings.instagram_comments_enabled}
                                onChange={value => this._onChange(value, 'instagram_comments_enabled')}
                                disabled={doesntHaveInstagramPermissions || doesntHaveInstagramId}
                            />
                            <BooleanField
                                name="import_history_enabled"
                                type="checkbox"
                                label="Import 30 days of history (posts and comments) as closed tickets"
                                value={this.state.settings.import_history_enabled}
                                onChange={value => this._onChange(value, 'import_history_enabled')}
                            />
                        </FormGroup>
                        <div>
                            {disabledInstagramComponent}
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            color="success"
                            className={classNames('mr-2', {
                                'btn-loading': loading.get('updateIntegration'),
                            })}
                            onClick={this._handleSubmit}
                        >
                            Save changes
                        </Button>
                        {
                            !isDisabled && (
                                <span>
                                <Button
                                    type="submit"
                                    color="warning"
                                    outline
                                    id="disable-integration-button"
                                    onClick={this._toggleDisableConfirmation}
                                >
                                    Disable this page
                                </Button>
                                <Popover
                                    placement="bottom"
                                    isOpen={this.state.askDisableConfirmation}
                                    target="disable-integration-button"
                                    toggle={this._toggleDisableConfirmation}
                                >
                                    <PopoverHeader>Are you sure?</PopoverHeader>
                                    <PopoverBody>
                                        <p>
                                            This page will not be synchronised with Gorgias anymore.
                                        </p>
                                        <Button
                                            type="submit"
                                            color="success"
                                            onClick={this._disable}
                                        >
                                            Confirm
                                        </Button>
                                    </PopoverBody>
                                </Popover>
                            </span>
                            )
                        }
                        <ConfirmButton
                            color="secondary"
                            className="float-right"
                            content="Are you sure you want to delete this integration?"
                            confirm={() => actions.deleteIntegration(integration)}
                        >
                            <i className="material-icons mr-1 text-danger">delete</i>
                            Delete this page
                        </ConfirmButton>
                    </div>
                </Container>
            </div>
        )
    }
}

FacebookIntegrationDetail.propTypes = {
    integration: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired
}
