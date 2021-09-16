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
    Alert,
} from 'reactstrap'

import history from '../../../../../history'
import Loader from '../../../../../common/components/Loader/Loader'
import ToggleButton from '../../../../../common/components/ToggleButton'
import PageHeader from '../../../../../common/components/PageHeader'
import Pagination from '../../../../../common/components/Pagination'
import BooleanField from '../../../../../common/forms/BooleanField.js'
import {
    getOnboardingMeta,
    getOnboardingIntegrations,
} from '../../../../../../state/integrations/selectors'
import pageIconDefault from '../../../../../../../img/integrations/facebook-page.png'
import {
    canEnableMetaSetting,
    FacebookRole,
    getFacebookUserTypeByRoles,
    getInstagramDMSettingsInlineComponent,
    getInstagramDMSettingStatus,
    hasFacebookRole,
    InstagramDMSettingStatus,
} from '../utils'
import {getCurrentPlan} from '../../../../../../state/billing/selectors'
import {AccountFeature} from '../../../../../../state/currentAccount/types'
import {FACEBOOK_MENTION_ENABLED_DOMAINS} from '../../../../../../config/integrations/facebook'
import {IntegrationType} from '../../../../../../models/integration/types'
import {RootState} from '../../../../../../state/types'
import {
    activateOnboardingIntegrations,
    fetchFacebookOnboardingIntegrations,
    fetchIntegrations,
} from '../../../../../../state/integrations/actions'

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
            IntegrationType.FacebookIntegrationType
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
            selectedIntegrations = selectedIntegrations.filter(
                (value) => value!.get('id') === id
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
        const {
            integrations,
            pagination,
            currentAccount,
            currentPlan,
        } = this.props
        const {selectedIntegrations, isLoading} = this.state

        if (integrations.isEmpty()) {
            return null
        }
        const mentionEnabledDomain =
            FACEBOOK_MENTION_ENABLED_DOMAINS.indexOf(
                currentAccount.get('domain')
            ) >= 0

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

                            let userRoles:
                                | string
                                | undefined
                                | FacebookRole[] = integration.getIn([
                                'meta',
                                'roles',
                            ]) as string | undefined
                            userRoles = userRoles
                                ? (userRoles.split(',') as FacebookRole[])
                                : []

                            let userPermissions:
                                | string
                                | undefined
                                | string[] = integration.getIn([
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

                            // Todo(@Mehdi): change this when the feature will be available to all accounts
                            const instagramDMSettingStatus = getInstagramDMSettingStatus(
                                canEnableInstagramDirectMessage,
                                integration
                            )
                            const currentPlanHasInstagramDMFeature = currentPlan.getIn(
                                [
                                    'features',
                                    AccountFeature.InstagramDirectMessage,
                                    'enabled',
                                ]
                            )
                            const isAllowedToInstagramDM =
                                instagramDMSettingStatus ===
                                    InstagramDMSettingStatus.ALLOWED &&
                                currentPlanHasInstagramDMFeature

                            const instagramDMSettingsInlineComponent = getInstagramDMSettingsInlineComponent(
                                instagramDMSettingStatus,
                                currentAccount,
                                currentPlan
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
                                        <div className="d-flex mt-3">
                                            <Alert
                                                color="warning"
                                                className="d-flex align-items-center"
                                            >
                                                <i className="material-icons md-3 mr-3">
                                                    warning
                                                </i>
                                                In order to be able to integrate
                                                this page you need to have one
                                                of the following roles: Admin,
                                                Editor, Moderator.
                                            </Alert>
                                        </div>
                                    )}

                                    {pageEnabled &&
                                        !displayPermissionAlert &&
                                        canModerate &&
                                        instagramIsDisabled && (
                                            <div className="d-flex mt-3">
                                                <Alert
                                                    color="warning"
                                                    className="d-flex align-items-center"
                                                >
                                                    <i className="material-icons md-3 mr-3">
                                                        warning
                                                    </i>
                                                    Create an Instagram account
                                                    for this page and you will
                                                    be able to enable Instagram
                                                    features.
                                                </Alert>
                                            </div>
                                        )}

                                    {displayPermissionAlert && (
                                        <div className="d-flex mt-3">
                                            <Alert
                                                color="warning"
                                                className="align-items-center"
                                            >
                                                <i className="material-icons md-3 mr-3">
                                                    warning
                                                </i>
                                                Entire page or some features are
                                                disabled because you didn't
                                                grant all the permissions we
                                                asked for when logging to
                                                Facebook. To fix this, navigate
                                                to{' '}
                                                <a href="https://www.facebook.com/settings?tab=business_tools&ref=settings">
                                                    this URL
                                                </a>
                                                , delete the Gorgias app then
                                                try again.
                                            </Alert>
                                        </div>
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
                                                    <BooleanField
                                                        name={`${id}.messenger_enabled`}
                                                        type="checkbox"
                                                        label="Enable Messenger"
                                                        value={this._getSettingValue(
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
                                                        disabled={
                                                            !canEnableMessenger
                                                        }
                                                    />
                                                    <BooleanField
                                                        name={`${id}.posts_enabled`}
                                                        type="checkbox"
                                                        label="Enable Facebook posts, comments and ads comments"
                                                        value={this._getSettingValue(
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
                                                        disabled={
                                                            !canEnablePosts
                                                        }
                                                    />
                                                    {mentionEnabledDomain && (
                                                        <BooleanField
                                                            name={`${id}.mentions_enabled`}
                                                            type="checkbox"
                                                            label="Enable Facebook mentions"
                                                            value={this._getSettingValue(
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
                                                            disabled={
                                                                !canEnableMentions
                                                            }
                                                        />
                                                    )}
                                                    <BooleanField
                                                        name={`${id}.recommendations_enabled`}
                                                        type="checkbox"
                                                        label="Enable Facebook recommendations"
                                                        value={this._getSettingValue(
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
                                                        disabled={
                                                            !canEnableRecommendations
                                                        }
                                                    />
                                                    <BooleanField
                                                        name={`${id}.instagram_comments_enabled`}
                                                        type="checkbox"
                                                        label="Enable Instagram comments"
                                                        value={this._getSettingValue(
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
                                                        disabled={
                                                            !canEnableInstagramComments ||
                                                            instagramIsDisabled
                                                        }
                                                    />
                                                    <BooleanField
                                                        name={`${id}.instagram_mentions_enabled`}
                                                        type="checkbox"
                                                        label="Enable Instagram mentions"
                                                        value={this._getSettingValue(
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
                                                                        name={`${id}.instagram_direct_message_enabled`}
                                                                        type="checkbox"
                                                                        label="Enable Instagram direct messages"
                                                                        value={this._getSettingValue(
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
                                                        name={`${id}.instagram_ads_enabled`}
                                                        type="checkbox"
                                                        label="Enable Instagram ads"
                                                        value={this._getSettingValue(
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
                                                        disabled={
                                                            !canEnableInstagramAds ||
                                                            instagramIsDisabled
                                                        }
                                                    />
                                                </FormGroup>
                                            </div>

                                            <div>
                                                <p className="font-weight-medium">
                                                    Import your Facebook data:
                                                </p>
                                                <div className="d-md-flex">
                                                    <FormGroup className="mr-5">
                                                        <BooleanField
                                                            name={`${id}.import_history_enabled`}
                                                            type="checkbox"
                                                            label="Import 30 days of history (posts and comments) as closed tickets"
                                                            value={this._getSettingValue(
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
                                                            disabled={
                                                                !canEnablePosts
                                                            }
                                                        />
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

                <Container fluid className="page-container">
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
                                    'btn-loading': loading.get(
                                        'updateIntegration'
                                    ),
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
        integrations: getOnboardingIntegrations(
            IntegrationType.FacebookIntegrationType
        )(state),
        pagination: getOnboardingMeta(IntegrationType.FacebookIntegrationType)(
            state
        ),
        currentAccount: state.currentAccount,
        currentPlan: getCurrentPlan(state),
    }),
    {
        activateOnboardingIntegrations,
        fetchIntegrations,
        fetchFacebookOnboardingIntegrations,
    }
)

export default connector(FacebookIntegrationSetupContainer)
