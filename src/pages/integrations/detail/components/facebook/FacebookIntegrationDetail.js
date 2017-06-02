import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import _truncate from 'lodash/truncate'
import {
    Button,
    Popover,
    PopoverTitle,
    PopoverContent,
    Breadcrumb,
    BreadcrumbItem,
} from 'reactstrap'

import {Loader} from '../../../../common/components/Loader'
import {CheckboxField} from '../../../../common/forms'

export default class FacebookIntegrationDetail extends React.Component {
    state = {
        settings: {
            posts_enabled: true,
            private_messages_enabled: true,
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

    _onChange = (event) => {
        this.state.settings[event.target.name] = event.target.checked
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
        browserHistory.push('/app/integrations/facebook')
    }

    _toggleDisableConfirmation = () => {
        this.setState({askDisableConfirmation: !this.state.askDisableConfirmation})
    }

    render() {
        const {integration, loading, actions} = this.props

        const page = integration.get('facebook') || fromJS({})
        const isDisabled = integration.get('deactivated_datetime')

        if (loading.get('integration') || page.isEmpty()) {
            return <Loader />
        }

        return (
            <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/integrations">Integrations</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to="/app/integrations/facebook">Facebook</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        {page.get('name')}
                    </BreadcrumbItem>
                </Breadcrumb>

                <div className="d-flex align-items-center mb-3">
                    <img
                        className="ui image rounded mr-3"
                        alt={page.get('name')}
                        src={page.getIn(['picture', 'data', 'url'])}
                    />
                    <div className="d-flex flex-column">
                        <h2 className="header">
                            {page.get('name')}
                        </h2>
                        <p className="text-faded">
                            {_truncate(page.get('about'), {length: 100})}
                        </p>
                    </div>
                </div>

                <div className="ui form">
                    <div className="field">
                        <CheckboxField
                            label="Enable Facebook Messenger"
                            name="private_messages_enabled"
                            input={{
                                value: this.state.settings.private_messages_enabled,
                                onChange: this._onChange,
                            }}
                        />
                    </div>
                    <div className="field">
                        <CheckboxField
                            label="Enable Facebook Posts & Comments"
                            name="posts_enabled"
                            input={{
                                value: this.state.settings.posts_enabled,
                                onChange: this._onChange,
                            }}
                        />
                    </div>
                    <div className="field">
                        <CheckboxField
                            label="Import 30 days of history (posts, comments and messages) as closed tickets"
                            name="import_history_enabled"
                            input={{
                                value: this.state.settings.import_history_enabled,
                                onChange: this._onChange,
                            }}
                        />
                    </div>
                </div>

                <div className="mt-3">
                    <Button
                        type="submit"
                        color="primary"
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
                                    <PopoverTitle>Are you sure?</PopoverTitle>
                                    <PopoverContent>
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
                                    </PopoverContent>
                                </Popover>
                            </span>
                        )
                    }
                    <Button
                        type="button"
                        color="danger"
                        className={classNames('pull-right', {
                            'btn-loading': false,
                        })}
                        onClick={() => actions.deleteIntegration(integration)}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        )
    }
}

FacebookIntegrationDetail.propTypes = {
    integration: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired
}
