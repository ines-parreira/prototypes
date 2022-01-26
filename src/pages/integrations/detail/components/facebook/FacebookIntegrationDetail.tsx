import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import {fromJS, Map} from 'immutable'
import _truncate from 'lodash/truncate'
import {
    FormGroup,
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Container,
} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'

import warningIcon from 'assets/img/icons/warning2.svg'
import pageIconDefault from 'assets/img/integrations/facebook-page.png'

import {
    FACEBOOK_LANGUAGE_OPTIONS,
    FACEBOOK_LANGUAGE_DEFAULT,
} from '../../../../../config/integrations/facebook'
import InputField from '../../../../common/forms/InputField.js'
import BooleanField from '../../../../common/forms/BooleanField.js'
import Loader from '../../../../common/components/Loader/Loader'
import PageHeader from '../../../../common/components/PageHeader'
import DEPRECATED_ConfirmButton from '../../../../common/components/DEPRECATED_ConfirmButton'
import Alert, {AlertType} from '../../../../common/components/Alert/Alert'
import * as billingSelectors from '../../../../../state/billing/selectors'
import {AccountFeature} from '../../../../../state/currentAccount/types'
import {RootState} from '../../../../../state/types'
import {
    deleteIntegration,
    updateOrCreateIntegration,
} from '../../../../../state/integrations/actions'
import css from '../../../../settings/settings.less'

import FacebookIntegrationNavigation from './FacebookIntegrationNavigation'
import FacebookLoginButton from './FacebookLoginButton/FacebookLoginButton'
import {
    canEnableMetaSetting,
    FacebookRole,
    getFacebookUserTypeByRoles,
    getInstagramDMSettingsInlineComponent,
    getInstagramDMSettingStatus,
    hasFacebookRole,
    InstagramDMSettingStatus,
} from './utils'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    settings: {
        posts_enabled: boolean
        mentions_enabled: boolean
        recommendations_enabled: boolean
        messenger_enabled: boolean
        import_history_enabled: boolean
        instagram_comments_enabled: boolean
        instagram_mentions_enabled: boolean
        instagram_ads_enabled: boolean
        instagram_direct_message_enabled: boolean
    }
    language: string
    askDisableConfirmation: boolean
}

export class FacebookIntegrationDetail extends Component<Props, State> {
    state = {
        settings: {
            posts_enabled: false,
            mentions_enabled: false,
            recommendations_enabled: false,
            messenger_enabled: false,
            import_history_enabled: false,
            instagram_comments_enabled: false,
            instagram_mentions_enabled: false,
            instagram_ads_enabled: false,
            instagram_direct_message_enabled: false,
        },
        language: FACEBOOK_LANGUAGE_DEFAULT,
        askDisableConfirmation: false,
    }

    _updateState = (integration: Map<any, any>) => {
        const settings: Map<any, any> = integration.getIn(
            ['meta', 'settings'],
            fromJS({})
        )
        const language = integration.getIn(['meta', 'language'])

        const newState: Partial<State> = {}

        if (!settings.isEmpty()) {
            newState.settings = {
                posts_enabled: settings.get('posts_enabled'),
                mentions_enabled: settings.get('mentions_enabled'),
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

        this.setState(newState as State)
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

    _handleSubmit = (event: React.SyntheticEvent) => {
        event.preventDefault()
        const {integration, updateOrCreateIntegration} = this.props
        const {settings, language} = this.state
        const updated = integration.mergeDeep({
            meta: {language, settings},
        })
        void updateOrCreateIntegration(updated)
    }

    render() {
        const {
            integration,
            loading,
            currentAccount,
            currentPlan,
            deleteIntegration,
        } = this.props

        const integrationMeta: Map<any, any> =
            integration.get('meta') || fromJS({})

        let userRoles: string | undefined | FacebookRole[] = integration.getIn([
            'meta',
            'roles',
        ]) as string | undefined
        userRoles = userRoles ? (userRoles.split(',') as FacebookRole[]) : []

        let userPermissions: string | undefined | string[] = integration.getIn([
            'meta',
            'oauth',
            'scope',
        ]) as string | undefined
        userPermissions =
            typeof userPermissions === 'string'
                ? userPermissions.split(',')
                : []

        const canModerate = hasFacebookRole(userRoles, FacebookRole.Moderate)

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

        const canEnableMentions =
            canModerate &&
            canEnableMetaSetting(userPermissions, 'mentions_enabled')

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
            !canEnableMentions ||
            !canEnableRecommendations ||
            !canEnableInstagramComments ||
            !canEnableInstagramMentions ||
            !canEnableInstagramAds ||
            !canEnableInstagramDirectMessage

        //Todo(@Mehdi): change this when the feature is available for all accounts
        const instagramDMSettingStatus = getInstagramDMSettingStatus(
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

        const instagramDMSettingsInlineComponent =
            getInstagramDMSettingsInlineComponent(
                instagramDMSettingStatus,
                currentAccount,
                currentPlan
            )

        const isSubmitting = !!loading.get('updateIntegration')

        if (loading.get('integration') || integration.isEmpty()) {
            return <Loader />
        }

        const shouldDisplayDisabledWithTooltip =
            currentPlanHasInstagramDMFeature &&
            !instagramIsDisabled &&
            (instagramDMSettingStatus ===
                InstagramDMSettingStatus.SHOULD_RECONNECT ||
                instagramDMSettingStatus ===
                    InstagramDMSettingStatus.NOT_ALLOWED)

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
                        </Breadcrumb>
                    }
                />

                <FacebookIntegrationNavigation integration={integration} />

                <Container fluid className={css.pageContainer}>
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
                        <Alert
                            type={AlertType.Warning}
                            className={classNames(
                                'd-flex',
                                'align-items-center',
                                css.mt16
                            )}
                            icon
                        >
                            In order to be able to enable features for this
                            integration you need to have one of the following
                            roles on the page: Admin, Editor, Moderator.
                            <br />
                            If you already have all the permissions, please try
                            to reconnect the integration.
                        </Alert>
                    )}
                    {canModerate && instagramIsDisabled && (
                        <Alert
                            type={AlertType.Warning}
                            className={css.mt16}
                            icon
                        >
                            You cannot activate Instagram on this page: it is
                            not associated with any Instagram account.
                            <br />
                            If you just associated the page with an Instagram
                            account, please{' '}
                            <FacebookLoginButton reconnect link>
                                click here to update your integrations
                            </FacebookLoginButton>
                            .
                        </Alert>
                    )}
                    {canModerate && displayPermissionAlert && (
                        <Alert
                            type={AlertType.Warning}
                            className={classNames(
                                'align-items-center',
                                css.mt16,
                                css.mb16
                            )}
                            icon
                        >
                            Entire page or some features are disabled because
                            you didn't grant all the permissions we asked for
                            when logging to Facebook. To fix this, navigate to{' '}
                            <a href="https://www.facebook.com/settings?tab=business_tools&ref=settings">
                                this URL
                            </a>
                            , delete the Gorgias app then reconnect your
                            integration.
                        </Alert>
                    )}
                    <div className="d-md-flex">
                        <FormGroup className="mr-3">
                            <BooleanField
                                name="messenger_enabled"
                                type="checkbox"
                                label="Enable Messenger"
                                value={this.state.settings.messenger_enabled}
                                onChange={(value: boolean) =>
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
                                onChange={(value: boolean) =>
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
                                onChange={(value: boolean) =>
                                    this._onSettingChange(
                                        value,
                                        'recommendations_enabled'
                                    )
                                }
                                disabled={!canEnableRecommendations}
                            />
                            <BooleanField
                                name="mentions_enabled"
                                type="checkbox"
                                label="Enable Facebook mentions"
                                value={this.state.settings.mentions_enabled}
                                onChange={(value: boolean) =>
                                    this._onSettingChange(
                                        value,
                                        'mentions_enabled'
                                    )
                                }
                                disabled={!canEnableMentions}
                            />
                            <BooleanField
                                name="instagram_comments_enabled"
                                type="checkbox"
                                label="Enable Instagram comments"
                                value={
                                    this.state.settings
                                        .instagram_comments_enabled
                                }
                                onChange={(value: boolean) =>
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
                                onChange={(value: boolean) =>
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
                                                label={
                                                    <div
                                                        id="instagram_direct_message"
                                                        style={
                                                            shouldDisplayDisabledWithTooltip
                                                                ? {
                                                                      cursor: 'pointer',
                                                                  }
                                                                : undefined
                                                        }
                                                    >
                                                        <span
                                                            style={
                                                                shouldDisplayDisabledWithTooltip
                                                                    ? {
                                                                          borderBottom:
                                                                              '1px dashed #D2D7DE',
                                                                      }
                                                                    : undefined
                                                            }
                                                        >
                                                            Enable Instagram
                                                            direct messages
                                                        </span>
                                                        {!!shouldDisplayDisabledWithTooltip && (
                                                            <img
                                                                src={
                                                                    warningIcon
                                                                }
                                                                className="ml-3"
                                                                style={{
                                                                    verticalAlign:
                                                                        'text-bottom',
                                                                }}
                                                                alt="icon"
                                                            />
                                                        )}
                                                    </div>
                                                }
                                                value={
                                                    this.state.settings
                                                        .instagram_direct_message_enabled
                                                }
                                                onChange={(value: boolean) =>
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
                                onChange={(value: boolean) =>
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
                                onChange={(value: boolean) =>
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
                        {FACEBOOK_LANGUAGE_OPTIONS.map(
                            (option: Map<any, any>) => (
                                <option
                                    key={option.get('value')}
                                    value={option.get('value')}
                                >
                                    {option.get('label')}
                                </option>
                            )
                        )}
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
                        <DEPRECATED_ConfirmButton
                            color="secondary"
                            className="float-right"
                            content="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                            confirm={() => deleteIntegration(integration)}
                            disabled={isSubmitting}
                        >
                            <i className="material-icons mr-1 text-danger">
                                delete
                            </i>
                            Delete this page
                        </DEPRECATED_ConfirmButton>
                    </div>
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        currentAccount: state.currentAccount,
        currentPlan: billingSelectors.getCurrentPlan(state),
    }),
    {
        updateOrCreateIntegration,
        deleteIntegration,
    }
)

export default connector(FacebookIntegrationDetail)
