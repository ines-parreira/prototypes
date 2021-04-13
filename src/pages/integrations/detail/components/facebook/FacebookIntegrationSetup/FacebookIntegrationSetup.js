// @flow
import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {fromJS, type List, type Map} from 'immutable'
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

import {FACEBOOK_INTEGRATION_TYPE} from '../../../../../../constants/integration.ts'
import history from '../../../../../history.ts'
import Loader from '../../../../../common/components/Loader/Loader.tsx'
import ToggleButton from '../../../../../common/components/ToggleButton.tsx'
import PageHeader from '../../../../../common/components/PageHeader.tsx'
import Pagination from '../../../../../common/components/Pagination.tsx'
import BooleanField from '../../../../../common/forms/BooleanField'

import * as integrationsSelectors from '../../../../../../state/integrations/selectors.ts'

import pageIconDefault from '../../../../../../../img/integrations/facebook-page.png'

import {
    canEnableMetaSetting,
    getFacebookUserTypeByRoles,
    hasFacebookRole,
    MODERATE_ROLE,
} from '../utils'

import css from './FacebookIntegrationSetup.less'

type Props = {
    integrations: List<Map<*, *>>,
    pagination: Object,
    actions: Object,
    loading: Object,
}

type State = {
    selectedIntegrations: List<Map<*, *>>,
    isLoading: boolean,
}

export class FacebookIntegrationSetupContainer extends React.Component<
    Props,
    State
> {
    state = {
        selectedIntegrations: fromJS({}),
        isLoading: false,
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
            .activateOnboardingIntegrations(data, FACEBOOK_INTEGRATION_TYPE)
            .then(() => actions.fetchIntegrations())
        history.push('/app/settings/integrations/facebook')
    }

    _toggleIntegration = (integration: Map<*, *>, enable: boolean) => {
        let {selectedIntegrations} = this.state
        const id = integration.get('id')

        let userPermissions = integration.getIn(['meta', 'oauth', 'scope'])
        userPermissions = userPermissions ? userPermissions.split(',') : []

        const canEnableMessenger = canEnableMetaSetting(
            userPermissions,
            'messenger_enabled'
        )
        const canEnablePosts = canEnableMetaSetting(
            userPermissions,
            'posts_enabled'
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

        if (enable) {
            const basicSettings = {
                messenger_enabled: canEnableMessenger,
                posts_enabled: canEnablePosts,
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
            }
            // Todo(@Mehdi): change this when Instagram DM will be available to all accounts
            let additionalSettings = {}
            const isAllowedToInstagramDM = !!integration.getIn([
                'meta',
                'instagram',
                'instagram_direct_message_allowed',
            ])
            if (isAllowedToInstagramDM) {
                additionalSettings = {
                    instagram_direct_message_enabled:
                        canEnableInstagramDirectMessage &&
                        !!integration.getIn(['meta', 'instagram', 'id']),
                }
            }

            const settings = {...basicSettings, ...additionalSettings}

            selectedIntegrations = selectedIntegrations.set(
                id,
                integration.setIn(['meta', 'settings'], fromJS(settings))
            )
        } else {
            selectedIntegrations = selectedIntegrations.delete(id)
        }

        this.setState({selectedIntegrations})
    }

    _getSettingValue = (id: number, key: string): boolean => {
        return (
            this.state.selectedIntegrations.getIn([
                id,
                'meta',
                'settings',
                key,
            ]) || false
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

    _fetchPage = (page: number, silent: boolean = true) => {
        if (!silent) {
            this.setState({isLoading: true})
        }

        this.props.actions
            .fetchFacebookOnboardingIntegrations(page, !silent)
            .then(() => {
                if (!silent) {
                    this.setState({isLoading: false})
                }
            })
    }

    _renderIntegrations = () => {
        const {integrations, pagination} = this.props
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
                        integrations.map((integration) => {
                            const id = integration.get('id')

                            let userRoles = integration.getIn(['meta', 'roles'])
                            userRoles = userRoles ? userRoles.split(',') : []

                            let userPermissions = integration.getIn([
                                'meta',
                                'oauth',
                                'scope',
                            ])
                            userPermissions = userPermissions
                                ? userPermissions.split(',')
                                : []

                            const instagramIsDisabled = !integration.getIn([
                                'meta',
                                'instagram',
                                'id',
                            ])
                            const pageEnabled = selectedIntegrations.has(id)
                            const canModerate = hasFacebookRole(
                                userRoles,
                                MODERATE_ROLE
                            )

                            const canEnableMessenger = canEnableMetaSetting(
                                userPermissions,
                                'messenger_enabled'
                            )

                            const canEnablePosts = canEnableMetaSetting(
                                userPermissions,
                                'posts_enabled'
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
                            const isNotAllowedToInstagramDM = !integration.getIn(
                                [
                                    'meta',
                                    'instagram',
                                    'instagram_direct_message_allowed',
                                ]
                            )

                            const displayPermissionAlert =
                                !canEnableMessenger ||
                                !canEnablePosts ||
                                !canEnableRecommendations ||
                                !canEnableInstagramComments ||
                                !canEnableInstagramMentions ||
                                !canEnableInstagramAds ||
                                (!canEnableInstagramDirectMessage &&
                                    !isNotAllowedToInstagramDM)

                            const nothingToEnable =
                                !canEnableMessenger &&
                                !canEnablePosts &&
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
                                                        onChange={(value) =>
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
                                                        onChange={(value) =>
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
                                                    <BooleanField
                                                        name={`${id}.recommendations_enabled`}
                                                        type="checkbox"
                                                        label="Enable Facebook recommendations"
                                                        value={this._getSettingValue(
                                                            id,
                                                            'recommendations_enabled'
                                                        )}
                                                        onChange={(value) =>
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
                                                        onChange={(value) =>
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
                                                        onChange={(value) =>
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
                                                    <BooleanField
                                                        name={`${id}.instagram_ads_enabled`}
                                                        type="checkbox"
                                                        label="Enable Instagram ads"
                                                        value={this._getSettingValue(
                                                            id,
                                                            'instagram_ads_enabled'
                                                        )}
                                                        onChange={(value) =>
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
                                                    {!instagramIsDisabled &&
                                                        canEnableInstagramDirectMessage &&
                                                        !isNotAllowedToInstagramDM && (
                                                            <BooleanField
                                                                name={`${id}.instagram_direct_message_enabled`}
                                                                type="checkbox"
                                                                label="Enable Instagram direct message"
                                                                value={this._getSettingValue(
                                                                    id,
                                                                    'instagram_direct_message_enabled'
                                                                )}
                                                                onChange={(
                                                                    value
                                                                ) =>
                                                                    this._setSettingValue(
                                                                        id,
                                                                        'instagram_direct_message_enabled',
                                                                        value
                                                                    )
                                                                }
                                                            />
                                                        )}
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
                                                            onChange={(value) =>
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

const connector = connect((state) => ({
    integrations: integrationsSelectors.getOnboardingIntegrations(
        FACEBOOK_INTEGRATION_TYPE
    )(state),
    pagination: integrationsSelectors.getOnboardingMeta(
        FACEBOOK_INTEGRATION_TYPE
    )(state),
}))

export default connector(FacebookIntegrationSetupContainer)
