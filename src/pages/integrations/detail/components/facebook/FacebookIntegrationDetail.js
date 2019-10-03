// @flow
import React from 'react'
import {Link} from 'react-router'
import classNames from 'classnames'
import {fromJS, type Map} from 'immutable'
import _truncate from 'lodash/truncate'
import {
    Alert,
    FormGroup,
    Button,
    Breadcrumb,
    BreadcrumbItem, Container,
} from 'reactstrap'

import {FACEBOOK_LANGUAGE_OPTIONS, FACEBOOK_LANGUAGE_DEFAULT} from '../../../../../config/integrations/facebook'

import InputField from '../../../../common/forms/InputField'
import BooleanField from '../../../../common/forms/BooleanField'
import Loader from '../../../../common/components/Loader'
import PageHeader from '../../../../common/components/PageHeader'
import ConfirmButton from '../../../../common/components/ConfirmButton'

import pageIconDefault from '../../../../../../img/integrations/facebook-page.png'

import FacebookIntegrationNavigation from './FacebookIntegrationNavigation'
import FacebookLoginButton from './FacebookLoginButton'


type Props = {
    integration: Map<*, *>,
    actions: Object,
    loading: Map<*, *>
}

type State = {
    settings: {
        posts_enabled: boolean,
        messenger_enabled: boolean,
        import_history_enabled: boolean,
        instagram_comments_enabled: boolean,
        instagram_ads_enabled: boolean
    },
    language: string,
    askDisableConfirmation: boolean
}

export default class FacebookIntegrationDetail extends React.Component<Props, State> {
    state = {
        settings: {
            posts_enabled: true,
            messenger_enabled: true,
            import_history_enabled: true,
            instagram_comments_enabled: false,
            instagram_ads_enabled: false
        },
        language: FACEBOOK_LANGUAGE_DEFAULT,
        askDisableConfirmation: false,
    }

    _updateState = (integration: Map<*, *>) => {
        const settings = integration.getIn(['facebook', 'settings'], fromJS({}))
        const language = integration.getIn(['meta', 'language'])

        const newState = {}

        if (!settings.isEmpty()) {
            newState.settings = {
                posts_enabled: settings.get('posts_enabled'),
                messenger_enabled: settings.get('messenger_enabled'),
                import_history_enabled: settings.get('import_history_enabled'),
                instagram_comments_enabled: settings.get('instagram_comments_enabled'),
                instagram_ads_enabled: settings.get('instagram_ads_enabled', false),
            }
        }

        if (language) {
            newState.language = language
        }

        this.setState(newState)
    }

    componentWillMount() {
        this._updateState(this.props.integration)
    }

    componentWillReceiveProps(nextProps: Props) {
        // $FlowFixMe
        if (!nextProps.integration.isEmpty() && !nextProps.integration.equals(this.props.integration)) {
            this._updateState(nextProps.integration)
        }
    }

    _onSettingChange = (value: boolean, name: string) => {
        this.setState({
            settings: {
                ...this.state.settings,
                [name]: value
            }
        })
    }

    _handleSubmit = (event: SyntheticEvent<*>) => {
        event.preventDefault()
        const {actions, integration} = this.props
        const {settings, language} = this.state
        const updated = integration.mergeDeep({
            facebook: {settings},
            meta: {language}
        })
        actions.updateOrCreateIntegration(updated)
    }

    render() {
        const {integration, loading, actions} = this.props

        const integrationFacebook = integration.get('facebook') || fromJS({})

        const integrationScope = integration.getIn(['meta', 'oauth', 'scope']) || fromJS([])
        const doesntHaveInstagramPermissions = !integrationScope.includes('instagram_basic')
            || !integrationScope.includes('instagram_manage_comments')
        const doesntHaveAdsPermissions = !integrationScope.includes('ads_read')
            || !integrationScope.includes('ads_management')
        const doesntHaveInstagramId = !integration.getIn(['meta', 'instagram', 'id'])

        let alertComponent = null

        const isSubmitting = !!loading.get('updateIntegration')

        if (doesntHaveInstagramPermissions) {
            alertComponent = (
                <Alert color="warning">
                    <i className="material-icons md-2 mr-2">
                        warning
                    </i>
                    Instagram is disabled because we miss the required permissions. Please{' '}
                    <FacebookLoginButton
                        reconnect
                        link
                    >
                        click here to update your permissions
                    </FacebookLoginButton>.
                </Alert>
            )
        } else if (doesntHaveInstagramId) {
            alertComponent = (
                <Alert color="warning">
                    You cannot activate Instagram on this page: it is not associated with any Instagram account.<br/>
                    If you just associated the page with an Instagram account, please{' '}
                    <FacebookLoginButton
                        reconnect
                        link
                    >
                        click here to update your integrations
                    </FacebookLoginButton>.
                </Alert>
            )
        } else if (doesntHaveAdsPermissions) {
            alertComponent = (
                <Alert color="warning">
                    <i className="material-icons md-2 mr-2">
                        warning
                    </i>
                    Ads are disabled because we miss the required permissions. Please{' '}
                    <FacebookLoginButton
                        reconnect
                        link
                    >
                        click here to update your permissions
                    </FacebookLoginButton>.
                </Alert>
            )
        }

        if (loading.get('integration') || integration.isEmpty()) {
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
                            {integration.get('name')}
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Overview
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <FacebookIntegrationNavigation integration={integration}/>

                <Container
                    fluid
                    className="page-container"
                >
                    <div className="d-flex align-items-center mb-3">
                        <img
                            className="image rounded mr-3"
                            width="30"
                            src={integrationFacebook.getIn(['picture', 'data', 'url'], pageIconDefault)}
                        />
                        <div className="text-truncate text-faded">
                            <h2 className="d-inline mr-3 text-info">
                                {integration.get('name')}
                            </h2>
                            <span>
                                {_truncate(integrationFacebook.get('about'), {length: 100})}
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
                                onChange={(value) => this._onSettingChange(value, 'messenger_enabled')}
                            />
                            <BooleanField
                                name="posts_enabled"
                                type="checkbox"
                                label="Enable Facebook posts, comments and ads comments"
                                value={this.state.settings.posts_enabled}
                                onChange={(value) => this._onSettingChange(value, 'posts_enabled')}
                            />
                            <BooleanField
                                name="instagram_comments_enabled"
                                type="checkbox"
                                label="Enable Instagram comments"
                                value={this.state.settings.instagram_comments_enabled}
                                onChange={(value) => this._onSettingChange(value, 'instagram_comments_enabled')}
                                disabled={doesntHaveInstagramPermissions || doesntHaveInstagramId}
                            />
                            <BooleanField
                                name="instagram_ads_enabled"
                                type="checkbox"
                                label="Enable Instagram ads"
                                value={this.state.settings.instagram_ads_enabled}
                                onChange={(value) => this._onSettingChange(value, 'instagram_ads_enabled')}
                                disabled={
                                    doesntHaveInstagramPermissions ||
                                    doesntHaveAdsPermissions ||
                                    doesntHaveInstagramId
                                }
                            />
                            <BooleanField
                                name="import_history_enabled"
                                type="checkbox"
                                label="Import 30 days of history (posts and comments) as closed tickets"
                                value={this.state.settings.import_history_enabled}
                                onChange={(value) => this._onSettingChange(value, 'import_history_enabled')}
                            />
                        </FormGroup>
                        <div>
                            {alertComponent}
                        </div>
                    </div>

                    <InputField
                        type="select"
                        value={this.state.language}
                        options={FACEBOOK_LANGUAGE_OPTIONS.toJS()}
                        onChange={(language) => this.setState({language})}
                        label="Language"
                    >
                        {
                            FACEBOOK_LANGUAGE_OPTIONS.map((option) => (
                                <option
                                    key={option.get('value')}
                                    value={option.get('value')}
                                >
                                    {option.get('label')}
                                </option>
                            ))
                        }
                    </InputField>

                    <div>
                        <Button
                            type="submit"
                            color="success"
                            className={classNames('mr-2', {
                                'btn-loading': isSubmitting,
                            })}
                            disabled={isSubmitting}
                            onClick={this._handleSubmit}
                        >
                            Save changes
                        </Button>
                        <FacebookLoginButton reconnect/>
                        <ConfirmButton
                            color="secondary"
                            className="float-right"
                            content="Are you sure you want to delete this integration?"
                            confirm={() => actions.deleteIntegration(integration)}
                            disabled={isSubmitting}
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
