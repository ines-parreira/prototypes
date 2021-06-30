// @flow
import React from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import {fromJS, type Map} from 'immutable'
import _truncate from 'lodash/truncate'
import {
    Alert,
    FormGroup,
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Container,
} from 'reactstrap'

import {connect} from 'react-redux'

import {
    FACEBOOK_LANGUAGE_OPTIONS,
    FACEBOOK_LANGUAGE_DEFAULT,
} from '../../../../../config/integrations/facebook.ts'

import InputField from '../../../../common/forms/InputField'
import BooleanField from '../../../../common/forms/BooleanField'
import Loader from '../../../../common/components/Loader/Loader.tsx'
import PageHeader from '../../../../common/components/PageHeader.tsx'
import ConfirmButton from '../../../../common/components/ConfirmButton.tsx'

import pageIconDefault from '../../../../../../img/integrations/facebook-page.png'

import * as billingSelectors from '../../../../../state/billing/selectors.ts'

import {AccountFeature} from '../../../../../state/currentAccount/types.ts'

import FacebookIntegrationNavigation from './FacebookIntegrationNavigation'
import FacebookLoginButton from './FacebookLoginButton'
import {
    canEnableMetaSetting,
    getFacebookUserTypeByRoles,
    getInstagramDMSettingsInlineComponent,
    getInstagramDMSettingStatus,
    hasFacebookRole,
    InstagramDMSettingStatus,
    MODERATE_ROLE,
} from './utils'

type Props = {
    integration: Map<*, *>,
    actions: Object,
    loading: Map<*, *>,
    currentAccount: Map<string, any>,
    currentPlan: Object,
}

type State = {
    settings: {
        posts_enabled: boolean,
        recommendations_enabled: boolean,
        messenger_enabled: boolean,
        import_history_enabled: boolean,
        instagram_comments_enabled: boolean,
        instagram_mentions_enabled: boolean,
        instagram_ads_enabled: boolean,
        instagram_direct_message_enabled: boolean,
    },
    language: string,
    askDisableConfirmation: boolean,
}

export class FacebookIntegrationDetail extends React.Component<Props, State> {
    state = {
        settings: {
            posts_enabled: true,
            recommendations_enabled: true,
            messenger_enabled: true,
            import_history_enabled: true,
            instagram_comments_enabled: false,
            instagram_mentions_enabled: false,
            instagram_ads_enabled: false,
            instagram_direct_message_enabled: false,
        },
        language: FACEBOOK_LANGUAGE_DEFAULT,
        askDisableConfirmation: false,
    }

    _updateState = (integration: Map<*, *>) => {
        const settings = integration.getIn(['meta', 'settings'], fromJS({}))
        const language = integration.getIn(['meta', 'language'])

        const newState = {}

        if (!settings.isEmpty()) {
            newState.settings = {
                posts_enabled: settings.get('posts_enabled'),
                recommendations_enabled: settings.get(
                    'recommendations_enabled'
                ),
                messenger_enabled: settings.get('messenger_enabled'),
                import_history_enabled: settings.get('import_history_enabled'),
                instagram_comments_enabled: settings.get(
                    'instagram_comments_enabled'
                ),
                instagram_mentions_enabled: settings.get(
                    'instagram_mentions_enabled'
                ),
                instagram_ads_enabled: settings.get(
                    'instagram_ads_enabled',
                    false
                ),
                instagram_direct_message_enabled: settings.get(
                    'instagram_direct_message_enabled',
                    false
                ),
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
        if (
            !nextProps.integration.isEmpty() &&
            !nextProps.integration.equals(this.props.integration)
        ) {
            this._updateState(nextProps.integration)
        }
    }

    _onSettingChange = (value: boolean, name: string) => {
        this.setState({
            settings: {
                ...this.state.settings,
                [name]: value,
            },
        })
    }

    _handleSubmit = (event: SyntheticEvent<*>) => {
        event.preventDefault()
        const {actions, integration} = this.props
        const {settings, language} = this.state
        const updated = integration.mergeDeep({
            meta: {language, settings},
        })
        actions.updateOrCreateIntegration(updated)
    }

    render() {
        const {
            integration,
            loading,
            actions,
            currentAccount,
            currentPlan,
        } = this.props

        const integrationMeta = integration.get('meta') || fromJS({})

        let userRoles = integration.getIn(['meta', 'roles'])
        userRoles = userRoles ? userRoles.split(',') : []

        let userPermissions = integration.getIn(['meta', 'oauth', 'scope'])
        userPermissions = userPermissions ? userPermissions.split(',') : []

        const canModerate = hasFacebookRole(userRoles, MODERATE_ROLE)

        const instagramIsDisabled = !integration.getIn([
            'meta',
            'instagram',
            'id',
        ])

        const canEnableMessenger =
            canModerate &&
            canEnableMetaSetting(userPermissions, 'messenger_enabled')

        const canEnablePosts =
            canModerate &&
            canEnableMetaSetting(userPermissions, 'posts_enabled')

        const canEnableRecommendations =
            canModerate &&
            canEnableMetaSetting(userPermissions, 'recommendations_enabled')

        const canEnableInstagramComments =
            canModerate &&
            canEnableMetaSetting(userPermissions, 'instagram_comments_enabled')

        const canEnableInstagramMentions =
            canModerate &&
            canEnableMetaSetting(userPermissions, 'instagram_mentions_enabled')

        const canEnableInstagramAds =
            canModerate &&
            canEnableMetaSetting(userPermissions, 'instagram_ads_enabled')

        const canEnableInstagramDirectMessage =
            canModerate &&
            canEnableMetaSetting(
                userPermissions,
                'instagram_direct_message_enabled'
            )

        const displayPermissionAlert =
            !canEnableMessenger ||
            !canEnablePosts ||
            !canEnableRecommendations ||
            !canEnableInstagramComments ||
            !canEnableInstagramMentions ||
            !canEnableInstagramAds ||
            !canEnableInstagramDirectMessage

        //Todo(@Mehdi): change this when the feature is available for all accounts
        const instagramDMSettingStatus = getInstagramDMSettingStatus(
            // $FlowFixMe
            canEnableInstagramDirectMessage,
            integration
        )

        const currentPlanHasInstagramDMFeature = currentPlan.getIn([
            'features',
            AccountFeature.InstagramDirectMessage,
            'enabled',
        ])

        const isAllowedToInstagramDM =
            instagramDMSettingStatus === InstagramDMSettingStatus.ALLOWED &&
            currentPlanHasInstagramDMFeature

        const instagramDMSettingsInlineComponent = getInstagramDMSettingsInlineComponent(
            instagramDMSettingStatus,
            currentAccount,
            currentPlan
        )

        const isSubmitting = !!loading.get('updateIntegration')

        if (loading.get('integration') || integration.isEmpty()) {
            return <Loader />
        }

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
                                <Link to="/app/settings/integrations/facebook">
                                    Facebook, Messenger & Instagram
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                            <BreadcrumbItem active>Overview</BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <FacebookIntegrationNavigation integration={integration} />

                <Container fluid className="page-container">
                    <div className="d-flex align-items-center mb-3">
                        <img
                            alt="facebook logo"
                            className="image rounded mr-3"
                            width="30"
                            src={integrationMeta.getIn(
                                ['picture', 'data', 'url'],
                                pageIconDefault
                            )}
                        />
                        <div className="text-truncate text-faded">
                            <h2 className="d-inline mr-3 text-info">
                                {integration.get('name')}
                            </h2>
                            <span className="mr-3">
                                [{getFacebookUserTypeByRoles(userRoles)}]
                            </span>
                            <span>
                                {_truncate(integrationMeta.get('about'), {
                                    length: 100,
                                })}
                            </span>
                        </div>
                    </div>

                    {!canModerate && (
                        <div className="d-flex mt-3">
                            <Alert
                                color="warning"
                                className="d-flex align-items-center"
                            >
                                <i className="material-icons md-3 mr-3">
                                    warning
                                </i>
                                In order to be able to enable features for this
                                integration you need to have one of the
                                following roles on the page: Admin, Editor,
                                Moderator.
                                <br />
                                If you already have all the permissions, please
                                try to reconnect the integration.
                            </Alert>
                        </div>
                    )}
                    {canModerate && instagramIsDisabled && (
                        <div className="d-flex mt-3">
                            <Alert color="warning">
                                <i className="material-icons md-3 mr-3">
                                    warning
                                </i>
                                You cannot activate Instagram on this page: it
                                is not associated with any Instagram account.
                                <br />
                                If you just associated the page with an
                                Instagram account, please{' '}
                                <FacebookLoginButton reconnect link>
                                    click here to update your integrations
                                </FacebookLoginButton>
                                .
                            </Alert>
                        </div>
                    )}
                    {canModerate && displayPermissionAlert && (
                        <div className="d-flex mt-3">
                            <Alert
                                color="warning"
                                className="align-items-center"
                            >
                                <i className="material-icons md-3 mr-3">
                                    warning
                                </i>
                                Entire page or some features are disabled
                                because you didn't grant all the permissions we
                                asked for when logging to Facebook. To fix this,
                                navigate to{' '}
                                <a href="https://www.facebook.com/settings?tab=business_tools&ref=settings">
                                    this URL
                                </a>
                                , delete the Gorgias app then reconnect your
                                integration.
                            </Alert>
                        </div>
                    )}
                    <div className="d-md-flex">
                        <FormGroup className="mr-3">
                            <BooleanField
                                name="messenger_enabled"
                                type="checkbox"
                                label="Enable Messenger"
                                value={this.state.settings.messenger_enabled}
                                onChange={(value) =>
                                    this._onSettingChange(
                                        value,
                                        'messenger_enabled'
                                    )
                                }
                                disabled={!canEnableMessenger}
                            />
                            <BooleanField
                                name="posts_enabled"
                                type="checkbox"
                                label="Enable Facebook posts, comments and ads comments"
                                value={this.state.settings.posts_enabled}
                                onChange={(value) =>
                                    this._onSettingChange(
                                        value,
                                        'posts_enabled'
                                    )
                                }
                                disabled={!canEnablePosts}
                            />
                            <BooleanField
                                name="recommendations_enabled"
                                type="checkbox"
                                label="Enable Facebook recommendations"
                                value={
                                    this.state.settings.recommendations_enabled
                                }
                                onChange={(value) =>
                                    this._onSettingChange(
                                        value,
                                        'recommendations_enabled'
                                    )
                                }
                                disabled={!canEnableRecommendations}
                            />

                            <BooleanField
                                name="instagram_comments_enabled"
                                type="checkbox"
                                label="Enable Instagram comments"
                                value={
                                    this.state.settings
                                        .instagram_comments_enabled
                                }
                                onChange={(value) =>
                                    this._onSettingChange(
                                        value,
                                        'instagram_comments_enabled'
                                    )
                                }
                                disabled={
                                    !canEnableInstagramComments ||
                                    instagramIsDisabled
                                }
                            />
                            <BooleanField
                                name="instagram_mentions_enabled"
                                type="checkbox"
                                label="Enable Instagram mentions"
                                value={
                                    this.state.settings
                                        .instagram_mentions_enabled
                                }
                                onChange={(value) =>
                                    this._onSettingChange(
                                        value,
                                        'instagram_mentions_enabled'
                                    )
                                }
                                disabled={
                                    !canEnableInstagramMentions ||
                                    instagramIsDisabled
                                }
                            />
                            <table>
                                <tbody>
                                    <tr>
                                        <td className="pl-0">
                                            <BooleanField
                                                name="instagram_direct_message_enabled"
                                                type="checkbox"
                                                label="Enable Instagram direct messages"
                                                value={
                                                    this.state.settings
                                                        .instagram_direct_message_enabled
                                                }
                                                onChange={(value) =>
                                                    this._onSettingChange(
                                                        value,
                                                        'instagram_direct_message_enabled'
                                                    )
                                                }
                                                disabled={
                                                    !canEnableInstagramDirectMessage ||
                                                    instagramIsDisabled ||
                                                    !isAllowedToInstagramDM
                                                }
                                            />
                                        </td>
                                        <td className="pl-0">
                                            {!instagramIsDisabled &&
                                                instagramDMSettingsInlineComponent}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <BooleanField
                                name="instagram_ads_enabled"
                                type="checkbox"
                                label="Enable Instagram ads"
                                value={
                                    this.state.settings.instagram_ads_enabled
                                }
                                onChange={(value) =>
                                    this._onSettingChange(
                                        value,
                                        'instagram_ads_enabled'
                                    )
                                }
                                disabled={
                                    !canEnableInstagramAds ||
                                    instagramIsDisabled
                                }
                            />
                            <BooleanField
                                name="import_history_enabled"
                                type="checkbox"
                                label="Import 30 days of history (posts and comments) as closed tickets"
                                value={
                                    this.state.settings.import_history_enabled
                                }
                                onChange={(value) =>
                                    this._onSettingChange(
                                        value,
                                        'import_history_enabled'
                                    )
                                }
                                disabled={!canEnablePosts}
                            />
                        </FormGroup>
                    </div>

                    <InputField
                        type="select"
                        value={this.state.language}
                        options={FACEBOOK_LANGUAGE_OPTIONS.toJS()}
                        onChange={(language) => this.setState({language})}
                        label="Language"
                    >
                        {FACEBOOK_LANGUAGE_OPTIONS.map((option) => (
                            <option
                                key={option.get('value')}
                                value={option.get('value')}
                            >
                                {option.get('label')}
                            </option>
                        ))}
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
                        <FacebookLoginButton reconnect />
                        <ConfirmButton
                            color="secondary"
                            className="float-right"
                            content="Are you sure you want to delete this integration?"
                            confirm={() =>
                                actions.deleteIntegration(integration)
                            }
                            disabled={isSubmitting}
                        >
                            <i className="material-icons mr-1 text-danger">
                                delete
                            </i>
                            Delete this page
                        </ConfirmButton>
                    </div>
                </Container>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    currentAccount: state.currentAccount,
    currentPlan: billingSelectors.getCurrentPlan(state),
})

export default connect(mapStateToProps)(FacebookIntegrationDetail)
