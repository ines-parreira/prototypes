import React, {Component, FormEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {fromJS, List, Map} from 'immutable'
import _truncate from 'lodash/truncate'
import {
    Form,
    FormGroup,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Container,
} from 'reactstrap'

import pageIconDefault from 'assets/img/integrations/facebook-page.png'
import warningIcon from 'assets/img/icons/warning2.svg'
import {IntegrationType} from 'models/integration/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import Pagination from 'pages/common/components/Pagination'
import ToggleButton from 'pages/common/components/ToggleButton'
import CheckBox from 'pages/common/forms/CheckBox'
import history from 'pages/history'
import settingsCss from 'pages/settings/settings.less'
import {DEPRECATED_getCurrentPlan} from 'state/billing/selectors'
import {AccountFeature} from 'state/currentAccount/types'
import {
    activateOnboardingIntegrations,
    fetchFacebookOnboardingIntegrations,
    fetchIntegrations,
} from 'state/integrations/actions'
import {
    getOnboardingMeta,
    getOnboardingIntegrations,
} from 'state/integrations/selectors'
import {RootState} from 'state/types'

import {
    canEnableMetaSetting,
    FacebookRole,
    getFacebookUserTypeByRoles,
    getInstagramDMSettingsInlineComponent,
    getInstagramDMSettingStatus,
    hasFacebookRole,
    InstagramDMSettingStatus,
} from '../utils'
import css from './FacebookIntegrationSetup.less'

type Props = {
    loading: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    selectedIntegrations: List<Map<any, any>>
    isLoading: boolean
}

export class FacebookIntegrationSetupContainer extends Component<Props, State> {
    state: State = {
        selectedIntegrations: fromJS([]),
        isLoading: false,
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
        const {activateOnboardingIntegrations} = this.props
        const {selectedIntegrations} = this.state

        const data = selectedIntegrations
            .filter((integration) => !!integration)
            .map((integration) =>
                (fromJS(integration) as Map<any, any>).set(
                    'deleted_datetime',
                    null
                )
            )
            .toList()
            .toJS()

        void activateOnboardingIntegrations(
            data,
            IntegrationType.Facebook
        ).then(() => fetchIntegrations())
        history.push('/app/settings/integrations/facebook')
    }

    _toggleIntegration = (integration: Map<any, any>, enable: boolean) => {
        let {selectedIntegrations} = this.state
        const id: number = integration.get('id')

        const {currentPlan} = this.props

        const currentPlanHasInstagramDMFeature = currentPlan.getIn([
            'features',
            AccountFeature.InstagramDirectMessage,
            'enabled',
        ])

        let userPermissions: string | undefined | string[] = integration.getIn([
            'meta',
            'oauth',
            'scope',
        ]) as string | undefined
        userPermissions = userPermissions ? userPermissions.split(',') : []

        const canEnableMessenger = canEnableMetaSetting(
            userPermissions,
            'messenger_enabled'
        )
        const canEnablePosts = canEnableMetaSetting(
            userPermissions,
            'posts_enabled'
        )
        const canEnableMentions = false
        /* Disabled by default until mentions are available to all accounts
         * canEnableMetaSetting(
         *   userPermissions,
         *   'mentions_enabled'
         * )
         */
        const canEnableRecommendations = canEnableMetaSetting(
            userPermissions,
            'recommendations_enabled'
        )
        const canEnableInstagramComments = canEnableMetaSetting(
            userPermissions,
            'instagram_comments_enabled'
        )
        const canEnableInstagramMentions = canEnableMetaSetting(
            userPermissions,
            'instagram_mentions_enabled'
        )
        const canEnableInstagramAds = canEnableMetaSetting(
            userPermissions,
            'instagram_ads_enabled'
        )
        const canEnableInstagramDirectMessage = canEnableMetaSetting(
            userPermissions,
            'instagram_direct_message_enabled'
        )

        if (enable) {
            // Todo(@Mehdi): change this when Instagram DM will be available to all accounts
            const instagramDMSettingStatus = getInstagramDMSettingStatus(
                canEnableInstagramDirectMessage,
                integration
            )
            const isAllowedToInstagramDM =
                instagramDMSettingStatus === InstagramDMSettingStatus.ALLOWED &&
                currentPlanHasInstagramDMFeature

            const settings = {
                messenger_enabled: canEnableMessenger,
                posts_enabled: canEnablePosts,
                mentions_enabled: canEnableMentions,
                recommendations_enabled: canEnableRecommendations,
                instagram_comments_enabled:
                    canEnableInstagramComments &&
                    !!integration.getIn(['meta', 'instagram', 'id']),
                instagram_mentions_enabled:
                    canEnableInstagramMentions &&
                    !!integration.getIn(['meta', 'instagram', 'id']),
                instagram_ads_enabled:
                    canEnableInstagramAds &&
                    !!integration.getIn(['meta', 'instagram', 'id']),
                instagram_direct_message_enabled:
                    canEnableInstagramDirectMessage &&
                    isAllowedToInstagramDM &&
                    !!integration.getIn(['meta', 'instagram', 'id']),
            }

            selectedIntegrations = selectedIntegrations.set(
                id,
                integration.setIn(['meta', 'settings'], fromJS(settings))
            )
        } else {
            // There are undefined values because of the `selectedIntegrations.set`
            // above.
            selectedIntegrations = selectedIntegrations.filter((value) =>
                value ? !(value.get('id') === id) : false
            ) as List<Map<any, any>>
        }

        this.setState({selectedIntegrations})
    }

    _getSettingValue = (id: number, key: string) => {
        return (
            (this.state.selectedIntegrations.getIn([
                id,
                'meta',
                'settings',
                key,
            ]) as boolean) || false
        )
    }

    _setSettingValue = (id: number, key: string, value: boolean) => {
        this.setState({
            selectedIntegrations: this.state.selectedIntegrations.setIn(
                [id, 'meta', 'settings', key],
                value
            ),
        })
    }

    _fetchPage = (page: number, silent = true) => {
        if (!silent) {
            this.setState({isLoading: true})
        }

        void this.props
            .fetchFacebookOnboardingIntegrations(page, !silent)
            .then(() => {
                if (!silent) {
                    this.setState({isLoading: false})
                }
            })
    }

    _renderIntegrations = () => {
        const {integrations, pagination, currentAccount, currentPlan} =
            this.props
        const {selectedIntegrations, isLoading} = this.state

        if (integrations.isEmpty()) {
            return null
        }

        return (
            <div className="mb-4">
                <p className="font-weight-medium">
                    We found {pagination.get('item_count')} pages associated
                    with your account. Please activate the pages you want to use
                    with Gorgias:
                </p>
                <div className="mb-2">
                    {isLoading ? (
                        <Loader></Loader>
                    ) : (
                        integrations.map((integration: Map<any, any>) => {
                            const id: number = integration.get('id')

                            let userRoles: string | undefined | FacebookRole[] =
                                integration.getIn(['meta', 'roles']) as
                                    | string
                                    | undefined
                            userRoles = userRoles
                                ? (userRoles.split(',') as FacebookRole[])
                                : []

                            let userPermissions: string | undefined | string[] =
                                integration.getIn([
                                    'meta',
                                    'oauth',
                                    'scope',
                                ]) as string | undefined
                            userPermissions = userPermissions
                                ? userPermissions.split(',')
                                : []

                            const instagramIsDisabled = !integration.getIn([
                                'meta',
                                'instagram',
                                'id',
                            ])
                            const pageEnabled = !!selectedIntegrations.get(id)
                            const canModerate = hasFacebookRole(
                                userRoles,
                                FacebookRole.Moderate
                            )

                            const canEnableMessenger = canEnableMetaSetting(
                                userPermissions,
                                'messenger_enabled'
                            )

                            const canEnablePosts = canEnableMetaSetting(
                                userPermissions,
                                'posts_enabled'
                            )

                            const canEnableMentions = canEnableMetaSetting(
                                userPermissions,
                                'mentions_enabled'
                            )

                            const canEnableRecommendations =
                                canEnableMetaSetting(
                                    userPermissions,
                                    'recommendations_enabled'
                                )

                            const canEnableInstagramComments =
                                canEnableMetaSetting(
                                    userPermissions,
                                    'instagram_comments_enabled'
                                )

                            const canEnableInstagramMentions =
                                canEnableMetaSetting(
                                    userPermissions,
                                    'instagram_mentions_enabled'
                                )

                            const canEnableInstagramAds = canEnableMetaSetting(
                                userPermissions,
                                'instagram_ads_enabled'
                            )

                            const canEnableInstagramDirectMessage =
                                canEnableMetaSetting(
                                    userPermissions,
                                    'instagram_direct_message_enabled'
                                )

                            // Todo(@Mehdi): change this when the feature will be available to all accounts
                            const instagramDMSettingStatus =
                                getInstagramDMSettingStatus(
                                    canEnableInstagramDirectMessage,
                                    integration
                                )
                            const currentPlanHasInstagramDMFeature =
                                currentPlan.getIn([
                                    'features',
                                    AccountFeature.InstagramDirectMessage,
                                    'enabled',
                                ])
                            const isAllowedToInstagramDM =
                                instagramDMSettingStatus ===
                                    InstagramDMSettingStatus.ALLOWED &&
                                currentPlanHasInstagramDMFeature

                            const instagramDMSettingsInlineComponent =
                                getInstagramDMSettingsInlineComponent(
                                    instagramDMSettingStatus,
                                    currentAccount,
                                    currentPlan,
                                    id
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

                            const nothingToEnable =
                                !canEnableMessenger &&
                                !canEnablePosts &&
                                !canEnableMentions &&
                                !canEnableRecommendations &&
                                !canEnableInstagramComments &&
                                !canEnableInstagramMentions &&
                                !canEnableInstagramAds &&
                                !canEnableInstagramDirectMessage

                            const shouldDisplayDisabledWithTooltip =
                                currentPlanHasInstagramDMFeature &&
                                !instagramIsDisabled &&
                                (instagramDMSettingStatus ===
                                    InstagramDMSettingStatus.SHOULD_RECONNECT ||
                                    instagramDMSettingStatus ===
                                        InstagramDMSettingStatus.NOT_ALLOWED)

                            return (
                                <div
                                    key={id}
                                    className={classnames(css.page, {
                                        [css.enabled]: !!pageEnabled,
                                    })}
                                >
                                    <div className="d-flex flex-wrap flex-md-nowrap">
                                        <div className="mr-auto">
                                            <div>
                                                <img
                                                    alt="facebook logo"
                                                    className={classnames(
                                                        'image rounded mr-3 mb-2 mb-md-0',
                                                        css.icon
                                                    )}
                                                    src={integration.getIn(
                                                        [
                                                            'meta',
                                                            'picture',
                                                            'data',
                                                            'url',
                                                        ],
                                                        pageIconDefault
                                                    )}
                                                />
                                                <div
                                                    className={classnames(
                                                        css.details,
                                                        'mr-3 text-faded'
                                                    )}
                                                >
                                                    <h3
                                                        className={classnames(
                                                            css.name,
                                                            'mr-3'
                                                        )}
                                                    >
                                                        {integration.getIn([
                                                            'meta',
                                                            'name',
                                                        ])}
                                                    </h3>
                                                    <span className="mr-3">
                                                        [
                                                        {getFacebookUserTypeByRoles(
                                                            userRoles
                                                        )}
                                                        ]
                                                    </span>
                                                    <span>
                                                        {_truncate(
                                                            integration.getIn([
                                                                'meta',
                                                                'about',
                                                            ]),
                                                            {length: 100}
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {!nothingToEnable && canModerate && (
                                            <ToggleButton
                                                value={pageEnabled}
                                                onChange={(value) =>
                                                    this._toggleIntegration(
                                                        integration,
                                                        value
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                    {!canModerate && (
                                        <Alert
                                            type={AlertType.Warning}
                                            className={settingsCss.mt16}
                                            icon
                                        >
                                            In order to be able to integrate
                                            this page you need to have one of
                                            the following roles: Admin, Editor,
                                            Moderator.
                                        </Alert>
                                    )}

                                    {pageEnabled &&
                                        !displayPermissionAlert &&
                                        canModerate &&
                                        instagramIsDisabled && (
                                            <Alert
                                                type={AlertType.Warning}
                                                className={settingsCss.mt16}
                                                icon
                                            >
                                                Create an Instagram account for
                                                this page and you will be able
                                                to enable Instagram features.
                                            </Alert>
                                        )}

                                    {displayPermissionAlert && (
                                        <Alert
                                            type={AlertType.Warning}
                                            className={settingsCss.mt16}
                                            icon
                                        >
                                            Entire page or some features are
                                            disabled because you didn't grant
                                            all the permissions we asked for
                                            when logging to Facebook. To fix
                                            this, navigate to{' '}
                                            <a href="https://www.facebook.com/settings?tab=business_tools&ref=settings">
                                                this URL
                                            </a>
                                            , delete the Gorgias app then try
                                            again.
                                        </Alert>
                                    )}
                                    {!nothingToEnable && canModerate && (
                                        <div className={css.settings}>
                                            <p className="font-weight-medium">
                                                Choose the Facebook channels you
                                                want to use to communicate with
                                                your customers:
                                            </p>

                                            <div className="d-md-flex">
                                                <FormGroup className="mr-5">
                                                    <CheckBox
                                                        className="mb-2"
                                                        name={`${id}.messenger_enabled`}
                                                        isChecked={this._getSettingValue(
                                                            id,
                                                            'messenger_enabled'
                                                        )}
                                                        onChange={(
                                                            value: boolean
                                                        ) =>
                                                            this._setSettingValue(
                                                                id,
                                                                'messenger_enabled',
                                                                value
                                                            )
                                                        }
                                                        isDisabled={
                                                            !canEnableMessenger
                                                        }
                                                    >
                                                        Enable Messenger
                                                    </CheckBox>
                                                    <CheckBox
                                                        className="mb-2"
                                                        name={`${id}.posts_enabled`}
                                                        isChecked={this._getSettingValue(
                                                            id,
                                                            'posts_enabled'
                                                        )}
                                                        onChange={(
                                                            value: boolean
                                                        ) =>
                                                            this._setSettingValue(
                                                                id,
                                                                'posts_enabled',
                                                                value
                                                            )
                                                        }
                                                        isDisabled={
                                                            !canEnablePosts
                                                        }
                                                    >
                                                        Enable Facebook posts,
                                                        comments and ads
                                                        comments
                                                    </CheckBox>
                                                    <CheckBox
                                                        className="mb-2"
                                                        name={`${id}.recommendations_enabled`}
                                                        isChecked={this._getSettingValue(
                                                            id,
                                                            'recommendations_enabled'
                                                        )}
                                                        onChange={(
                                                            value: boolean
                                                        ) =>
                                                            this._setSettingValue(
                                                                id,
                                                                'recommendations_enabled',
                                                                value
                                                            )
                                                        }
                                                        isDisabled={
                                                            !canEnableRecommendations
                                                        }
                                                    >
                                                        Enable Facebook
                                                        recommendations
                                                    </CheckBox>
                                                    <CheckBox
                                                        className="mb-2"
                                                        name={`${id}.mentions_enabled`}
                                                        isChecked={this._getSettingValue(
                                                            id,
                                                            'mentions_enabled'
                                                        )}
                                                        onChange={(
                                                            value: boolean
                                                        ) =>
                                                            this._setSettingValue(
                                                                id,
                                                                'mentions_enabled',
                                                                value
                                                            )
                                                        }
                                                        isDisabled={
                                                            !canEnableMentions
                                                        }
                                                    >
                                                        Enable Facebook mentions
                                                    </CheckBox>
                                                    <CheckBox
                                                        className="mb-2"
                                                        name={`${id}.instagram_comments_enabled`}
                                                        isChecked={this._getSettingValue(
                                                            id,
                                                            'instagram_comments_enabled'
                                                        )}
                                                        onChange={(
                                                            value: boolean
                                                        ) =>
                                                            this._setSettingValue(
                                                                id,
                                                                'instagram_comments_enabled',
                                                                value
                                                            )
                                                        }
                                                        isDisabled={
                                                            !canEnableInstagramComments ||
                                                            instagramIsDisabled
                                                        }
                                                    >
                                                        Enable Instagram
                                                        comments
                                                    </CheckBox>
                                                    <CheckBox
                                                        className="mb-2"
                                                        name={`${id}.instagram_mentions_enabled`}
                                                        isChecked={this._getSettingValue(
                                                            id,
                                                            'instagram_mentions_enabled'
                                                        )}
                                                        onChange={(
                                                            value: boolean
                                                        ) =>
                                                            this._setSettingValue(
                                                                id,
                                                                'instagram_mentions_enabled',
                                                                value
                                                            )
                                                        }
                                                        isDisabled={
                                                            !canEnableInstagramMentions ||
                                                            instagramIsDisabled
                                                        }
                                                    >
                                                        Enable Instagram
                                                        mentions
                                                    </CheckBox>
                                                    <table>
                                                        <tbody>
                                                            <tr>
                                                                <td className="pl-0">
                                                                    <CheckBox
                                                                        className="mb-2"
                                                                        name={`${id}.instagram_direct_message_enabled`}
                                                                        isChecked={this._getSettingValue(
                                                                            id,
                                                                            'instagram_direct_message_enabled'
                                                                        )}
                                                                        onChange={(
                                                                            value: boolean
                                                                        ) =>
                                                                            this._setSettingValue(
                                                                                id,
                                                                                'instagram_direct_message_enabled',
                                                                                value
                                                                            )
                                                                        }
                                                                        isDisabled={
                                                                            !canEnableInstagramDirectMessage ||
                                                                            instagramIsDisabled ||
                                                                            !isAllowedToInstagramDM
                                                                        }
                                                                    >
                                                                        <div
                                                                            id={`instagram_direct_message-${id}`}
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
                                                                                Enable
                                                                                Instagram
                                                                                direct
                                                                                messages
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
                                                                    </CheckBox>
                                                                </td>
                                                                <td className="pl-0">
                                                                    {!instagramIsDisabled &&
                                                                        instagramDMSettingsInlineComponent}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <CheckBox
                                                        className="mb-2"
                                                        name={`${id}.instagram_ads_enabled`}
                                                        isChecked={this._getSettingValue(
                                                            id,
                                                            'instagram_ads_enabled'
                                                        )}
                                                        onChange={(
                                                            value: boolean
                                                        ) =>
                                                            this._setSettingValue(
                                                                id,
                                                                'instagram_ads_enabled',
                                                                value
                                                            )
                                                        }
                                                        isDisabled={
                                                            !canEnableInstagramAds ||
                                                            instagramIsDisabled
                                                        }
                                                    >
                                                        Enable Instagram ads
                                                    </CheckBox>
                                                </FormGroup>
                                            </div>

                                            <div>
                                                <p className="font-weight-medium">
                                                    Import your Facebook data:
                                                </p>
                                                <div className="d-md-flex">
                                                    <FormGroup className="mr-5">
                                                        <CheckBox
                                                            className="mb-2"
                                                            name={`${id}.import_history_enabled`}
                                                            isChecked={this._getSettingValue(
                                                                id,
                                                                'import_history_enabled'
                                                            )}
                                                            onChange={(
                                                                value: boolean
                                                            ) =>
                                                                this._setSettingValue(
                                                                    id,
                                                                    'import_history_enabled',
                                                                    value
                                                                )
                                                            }
                                                            isDisabled={
                                                                !canEnablePosts
                                                            }
                                                        >
                                                            Import 30 days of
                                                            history (posts and
                                                            comments) as closed
                                                            tickets
                                                        </CheckBox>
                                                    </FormGroup>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
                <Pagination
                    onChange={(page) => this._fetchPage(page, false)}
                    pageCount={pagination.get('nb_pages')}
                    currentPage={pagination.get('page')}
                />
            </div>
        )
    }

    render() {
        const {loading} = this.props
        const {selectedIntegrations} = this.state

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
                                    Facebook
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                Facebook Pages setup
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <Container fluid className={settingsCss.pageContainer}>
                    <h1>Facebook Pages setup</h1>
                    <p>
                        One last step: choose the pages you want to manage with
                        Gorgias.
                        <br />
                        If you just wanted to re-activate your Facebook
                        integration or update your permissions: it's done, you
                        can leave this page.
                    </p>

                    <Form onSubmit={this._activateSelectedIntegrations}>
                        {this._renderIntegrations()}

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
                                Save changes
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
        integrations: getOnboardingIntegrations(IntegrationType.Facebook)(
            state
        ),
        pagination: getOnboardingMeta(IntegrationType.Facebook)(state),
        currentAccount: state.currentAccount,
        currentPlan: DEPRECATED_getCurrentPlan(state),
    }),
    {
        activateOnboardingIntegrations,
        fetchIntegrations,
        fetchFacebookOnboardingIntegrations,
    }
)

export default connector(FacebookIntegrationSetupContainer)
