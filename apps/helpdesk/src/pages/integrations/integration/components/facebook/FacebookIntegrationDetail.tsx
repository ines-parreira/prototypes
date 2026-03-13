import type { SyntheticEvent } from 'react'
import React, { Component } from 'react'

import classNames from 'classnames'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import merge from 'lodash/merge'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    Col,
    Container,
    FormGroup,
    Row,
} from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import warningIcon from 'assets/img/icons/warning2.svg'
import pageIconDefault from 'assets/img/integrations/facebook-page.png'
import {
    FACEBOOK_LANGUAGE_DEFAULT,
    FACEBOOK_LANGUAGE_OPTIONS,
} from 'config/integrations/facebook'
import type {
    FacebookIntegration,
    FacebookIntegrationSettings,
} from 'models/integration/types'
import { isFacebookIntegration } from 'models/integration/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import type { Props as CheckBoxFieldSetProps } from 'pages/integrations/integration/components/facebook/CheckBoxFieldSet/CheckBoxFieldSet'
import CheckBoxFieldSet from 'pages/integrations/integration/components/facebook/CheckBoxFieldSet/CheckBoxFieldSet'
import FacebookIntegrationDetailSummary from 'pages/integrations/integration/components/facebook/FacebookIntegrationDetailSummary/FacebookIntegrationDetailSummary'
import FacebookIntegrationNavigation from 'pages/integrations/integration/components/facebook/FacebookIntegrationNavigation'
import FacebookIntegrationLoginButton from 'pages/integrations/integration/components/facebook/FacebookLoginButton/FacebookIntegrationLoginButton'
import {
    canEnableMetaSetting,
    FacebookRole,
    getInstagramDMSettingsInlineComponent,
    getInstagramDMSettingStatus,
    hasFacebookRole,
    InstagramDMSettingStatus,
} from 'pages/integrations/integration/components/facebook/utils'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'
import css from 'pages/settings/settings.less'
import * as billingSelectors from 'state/billing/selectors'
import { AccountFeature } from 'state/currentAccount/types'
import {
    deleteIntegration,
    updateOrCreateIntegration,
} from 'state/integrations/actions'
import type { RootState } from 'state/types'

type Props = {
    integration: FacebookIntegration
    loading: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    settings: FacebookIntegrationSettings
    language: string
    askDisableConfirmation: boolean
}

export class FacebookIntegrationDetail extends Component<Props, State> {
    state: State = {
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

    _updateState = (integration: FacebookIntegration) => {
        const settings = integration.meta?.settings
        const language = integration.meta?.language

        const newState: Partial<State> = {}

        if (!isEmpty(settings)) {
            newState.settings = {
                posts_enabled: settings.posts_enabled,
                mentions_enabled: settings.mentions_enabled,
                recommendations_enabled: settings.recommendations_enabled,
                messenger_enabled: settings.messenger_enabled,
                import_history_enabled: settings.import_history_enabled,
                instagram_comments_enabled: settings.instagram_comments_enabled,
                instagram_mentions_enabled: settings.instagram_mentions_enabled,
                instagram_ads_enabled: settings.instagram_ads_enabled,
                instagram_direct_message_enabled:
                    settings.instagram_direct_message_enabled,
            }
        }

        if (language) {
            newState.language = language
        }

        this.setState(newState as State)
    }

    componentDidMount() {
        this._updateState(this.props.integration)
    }

    componentDidUpdate(prevProps: Props) {
        if (
            this.props.integration &&
            !isEqual(this.props.integration, prevProps.integration)
        ) {
            this._updateState(this.props.integration)
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

    _handleSubmit = (event: SyntheticEvent) => {
        event.preventDefault()
        const { integration, updateOrCreateIntegration } = this.props
        const { settings, language } = this.state
        const updated = merge(integration, {
            meta: { language, settings },
        })
        void updateOrCreateIntegration(fromJS(updated))
    }

    render() {
        const {
            integration,
            loading,
            currentAccount,
            currentHelpdeskProduct,
            deleteIntegration,
            hasInstagramDMFeature,
        } = this.props

        const integrationMeta = integration.meta || {}

        let userRoles: string | undefined | FacebookRole[] =
            integrationMeta.roles
        userRoles = userRoles ? (userRoles.split(',') as FacebookRole[]) : []

        let userPermissions: string | undefined | string[] =
            integrationMeta.oauth?.scope
        userPermissions =
            typeof userPermissions === 'string'
                ? userPermissions.split(',')
                : []

        const canModerate = hasFacebookRole(userRoles, FacebookRole.Moderate)

        const instagramIsDisabled = !integrationMeta.instagram?.id

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
                'instagram_direct_message_enabled',
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
            fromJS(integration),
        )

        const isAllowedToInstagramDM =
            instagramDMSettingStatus === InstagramDMSettingStatus.ALLOWED &&
            hasInstagramDMFeature

        const instagramDMSettingsInlineComponent =
            getInstagramDMSettingsInlineComponent(
                instagramDMSettingStatus,
                currentAccount,
                currentHelpdeskProduct,
            )

        const isSubmitting = !!loading.get('updateIntegration')

        if (loading.get('integration') || !integration) {
            return <Loader />
        }

        const shouldDisplayDisabledWithTooltip =
            hasInstagramDMFeature &&
            !instagramIsDisabled &&
            (instagramDMSettingStatus ===
                InstagramDMSettingStatus.SHOULD_RECONNECT ||
                instagramDMSettingStatus ===
                    InstagramDMSettingStatus.NOT_ALLOWED)

        const importSectionCheckboxes: CheckBoxFieldSetProps['checkboxes'] = [
            {
                name: 'import_history_enabled',
                isChecked: this.state.settings.import_history_enabled,
                isDisabled: !canEnablePosts,
                onChange: (value: boolean) =>
                    this._onSettingChange(value, 'import_history_enabled'),
                children:
                    'Import 30 days of history (posts and comments) as closed tickets',
            },
        ]

        const facebookSectionCheckboxes: CheckBoxFieldSetProps['checkboxes'] = [
            {
                name: 'messenger_enabled',
                isChecked: this.state.settings.messenger_enabled,
                onChange: (value: boolean) =>
                    this._onSettingChange(value, 'messenger_enabled'),
                isDisabled: !canEnableMessenger,
                children: 'Messenger',
            },
            {
                name: 'posts_enabled',
                isChecked: this.state.settings.posts_enabled,
                onChange: (value: boolean) =>
                    this._onSettingChange(value, 'posts_enabled'),
                isDisabled: !canEnablePosts,
                children: 'Posts, comments and ad comments',
            },
            {
                name: 'recommendations_enabled',
                isChecked: this.state.settings.recommendations_enabled,
                onChange: (value: boolean) =>
                    this._onSettingChange(value, 'recommendations_enabled'),
                isDisabled: !canEnableRecommendations,
                children: 'Recommendations',
            },
            {
                name: 'mentions_enabled',
                isChecked: this.state.settings.mentions_enabled,
                onChange: (value: boolean) =>
                    this._onSettingChange(value, 'mentions_enabled'),
                isDisabled: !canEnableMentions,
                children: 'Mentions',
            },
        ]

        const instagramSectionCheckboxes: CheckBoxFieldSetProps['checkboxes'] =
            [
                {
                    name: 'instagram_comments_enabled',
                    isChecked: this.state.settings.instagram_comments_enabled,
                    onChange: (value: boolean) =>
                        this._onSettingChange(
                            value,
                            'instagram_comments_enabled',
                        ),
                    isDisabled:
                        !canEnableInstagramComments || instagramIsDisabled,
                    children: 'Comments',
                },
                {
                    name: 'instagram_mentions_enabled',
                    isChecked: this.state.settings.instagram_mentions_enabled,
                    onChange: (value: boolean) =>
                        this._onSettingChange(
                            value,
                            'instagram_mentions_enabled',
                        ),
                    isDisabled:
                        !canEnableInstagramMentions || instagramIsDisabled,
                    children: 'Mentions',
                },
                {
                    name: 'instagram_direct_message_enabled',
                    isChecked:
                        this.state.settings.instagram_direct_message_enabled,
                    onChange: (value: boolean) =>
                        this._onSettingChange(
                            value,
                            'instagram_direct_message_enabled',
                        ),
                    isDisabled:
                        !canEnableInstagramDirectMessage ||
                        instagramIsDisabled ||
                        !isAllowedToInstagramDM,
                    additionalContent:
                        !instagramIsDisabled &&
                        instagramDMSettingsInlineComponent,
                    children: (
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
                                Direct messages
                            </span>
                            {!!shouldDisplayDisabledWithTooltip && (
                                <img
                                    src={warningIcon}
                                    className="ml-3"
                                    style={{
                                        verticalAlign: 'text-bottom',
                                    }}
                                    alt="icon"
                                />
                            )}
                        </div>
                    ),
                },
                {
                    name: 'instagram_ads_enabled',
                    isChecked: this.state.settings.instagram_ads_enabled,
                    onChange: (value: boolean) =>
                        this._onSettingChange(value, 'instagram_ads_enabled'),
                    isDisabled: !canEnableInstagramAds || instagramIsDisabled,
                    children: 'Ads',
                },
            ]

        if (!isFacebookIntegration(integration)) return null

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    All apps
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations/facebook">
                                    Facebook, Messenger & Instagram
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>{integration.name}</BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <FacebookIntegrationNavigation
                    integration={fromJS(integration)}
                />

                <Container fluid className={css.pageContainer}>
                    <Row>
                        <Col lg={6} xl={7}>
                            <FacebookIntegrationDetailSummary
                                icon={
                                    integrationMeta.picture?.data.url ||
                                    pageIconDefault
                                }
                                name={integration.name}
                                description={integrationMeta.about}
                            />

                            {!canModerate && (
                                <Alert
                                    type={AlertType.Warning}
                                    className={classNames(
                                        'd-flex',
                                        'align-items-center',
                                        css.mt16,
                                    )}
                                    icon
                                >
                                    In order to be able to enable features for
                                    this integration you need to have one of the
                                    following roles on the page: Admin, Editor,
                                    Moderator.
                                    <br />
                                    If you already have all the permissions,
                                    please try to reconnect the integration.
                                </Alert>
                            )}
                            {canModerate && displayPermissionAlert && (
                                <Alert
                                    type={AlertType.Warning}
                                    className={classNames(
                                        'align-items-center',
                                        css.mt16,
                                        css.mb16,
                                    )}
                                    icon
                                >
                                    {`Entire page or some features are disabled because you didn't grant all the permissions we asked for when logging to Facebook. To fix this, navigate to`}{' '}
                                    <a href="https://www.facebook.com/settings?tab=business_tools&ref=settings">
                                        this URL
                                    </a>
                                    , delete the Gorgias app then reconnect your
                                    integration.
                                </Alert>
                            )}
                            <div className="d-md-flex">
                                <FormGroup className="mr-3">
                                    <h3>Import</h3>
                                    <CheckBoxFieldSet
                                        checkboxes={importSectionCheckboxes}
                                    />
                                    <h3 className="mt-5">Settings</h3>
                                    <CheckBoxFieldSet
                                        title={'Facebook'}
                                        subtitle={
                                            'Receive tickets from Facebook for:'
                                        }
                                        checkboxes={facebookSectionCheckboxes}
                                    />
                                    {canModerate && instagramIsDisabled && (
                                        <Alert
                                            type={AlertType.Warning}
                                            className="mt-5"
                                            icon
                                        >
                                            You cannot activate Instagram on
                                            this page: it is not associated with
                                            any Instagram account.
                                            <br />
                                            If you just associated the page with
                                            an Instagram account, please{' '}
                                            <FacebookIntegrationLoginButton
                                                reconnect
                                                link
                                            >
                                                click here to update your
                                                integrations
                                            </FacebookIntegrationLoginButton>
                                            .
                                        </Alert>
                                    )}
                                    <CheckBoxFieldSet
                                        className="mt-4"
                                        title={
                                            <div className="d-flex align-items-center mb-1">
                                                <h4 className="mb-0">
                                                    Instagram
                                                </h4>
                                                {integrationMeta.instagram
                                                    ?.username && (
                                                    <p className="text-faded pl-3 mb-0">
                                                        @
                                                        {
                                                            integrationMeta
                                                                .instagram
                                                                .username
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        }
                                        subtitle={
                                            'Receive tickets from Instagram for:'
                                        }
                                        checkboxes={instagramSectionCheckboxes}
                                    />
                                </FormGroup>
                            </div>

                            <DEPRECATED_InputField
                                type="select"
                                value={this.state.language}
                                options={FACEBOOK_LANGUAGE_OPTIONS.toJS()}
                                onChange={(language) =>
                                    this.setState({ language })
                                }
                                label="Language"
                                className="mt-4"
                            >
                                {FACEBOOK_LANGUAGE_OPTIONS.map(
                                    (option: Map<any, any>) => (
                                        <option
                                            key={option.get('value')}
                                            value={option.get('value')}
                                        >
                                            {option.get('label')}
                                        </option>
                                    ),
                                )}
                            </DEPRECATED_InputField>

                            <div className="mt-5">
                                <Button
                                    type="submit"
                                    intent="primary"
                                    className={classNames('mr-2', {
                                        'btn-loading': isSubmitting,
                                    })}
                                    isDisabled={isSubmitting}
                                    onClick={this._handleSubmit}
                                >
                                    Save changes
                                </Button>
                                <ConfirmButton
                                    confirmationContent={
                                        INTEGRATION_REMOVAL_CONFIGURATION_TEXT
                                    }
                                    onConfirm={() =>
                                        deleteIntegration(fromJS(integration))
                                    }
                                    isLoading={isSubmitting}
                                    intent="destructive"
                                    className="float-right"
                                    leadingIcon="delete"
                                >
                                    Delete Page
                                </ConfirmButton>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        currentAccount: state.currentAccount,
        currentHelpdeskProduct: billingSelectors.getCurrentHelpdeskPlan(state),
        hasInstagramDMFeature: billingSelectors.makeHasFeature(state)(
            AccountFeature.InstagramDirectMessage,
        ),
    }),
    {
        updateOrCreateIntegration,
        deleteIntegration,
    },
)

export default connector(FacebookIntegrationDetail)
