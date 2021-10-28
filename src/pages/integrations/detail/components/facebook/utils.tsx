import React from 'react'
import {Alert} from 'reactstrap'
import {Map} from 'immutable'

import UpgradeButton from '../../../../common/components/UpgradeButton/UpgradeButton'
import {SegmentEvent} from '../../../../../store/middlewares/types/segmentTracker'
import {AccountFeature} from '../../../../../state/currentAccount/types'

// PERMISSIONS in FB documentation
// https://developers.facebook.com/docs/pages/overview/permissions-features#permissions
export const PAGES_MANAGE_ADS = 'pages_manage_ads'
export const PAGES_MANAGE_METADATA = 'pages_manage_metadata'
export const PAGES_READ_ENGAGEMENT = 'pages_read_engagement'
export const PAGES_READ_USER_CONTENT = 'pages_read_user_content'
export const PAGES_MANAGE_POSTS = 'pages_manage_posts'
export const PAGES_MANAGE_ENGAGEMENT = 'pages_manage_engagement'
export const BUSINESS_MANAGEMENT = 'business_management'
export const PAGES_SHOW_LIST = 'pages_show_list'
export const READ_PAGE_MAILBOXES = 'read_page_mailboxes'
export const PAGES_MESSAGING = 'pages_messaging'
export const PAGES_MESSAGING_SUBSCRIPTIONS = 'pages_messaging_subscriptions'
export const INSTAGRAM_BASIC = 'instagram_basic'
export const INSTAGRAM_MANAGE_COMMENTS = 'instagram_manage_comments'
export const ADS_READ = 'ads_read'
export const ADS_MANAGEMENT = 'ads_management'
export const INSTAGRAM_MANAGE_MESSAGES = 'instagram_manage_messages'

// /!\ THIS SHOULD BE IN SYNC WITH g/integrations/facebook/user_roles_permissions.py
export const PERMISSIONS_PER_INTEGRATION_META_SETTING = {
    messenger_enabled: [
        PAGES_MESSAGING,
        PAGES_MANAGE_METADATA,
        PAGES_SHOW_LIST,
        PAGES_MESSAGING_SUBSCRIPTIONS,
        READ_PAGE_MAILBOXES,
    ],
    posts_enabled: [
        PAGES_MANAGE_POSTS,
        PAGES_SHOW_LIST,
        PAGES_MANAGE_METADATA,
        PAGES_READ_ENGAGEMENT,
        PAGES_MANAGE_ENGAGEMENT,
        PAGES_READ_USER_CONTENT,
        PAGES_MANAGE_ADS,
    ],
    mentions_enabled: [
        PAGES_MANAGE_POSTS,
        PAGES_SHOW_LIST,
        PAGES_MANAGE_METADATA,
        PAGES_READ_ENGAGEMENT,
        PAGES_MANAGE_ENGAGEMENT,
        PAGES_READ_USER_CONTENT,
    ],
    instagram_comments_enabled: [
        INSTAGRAM_BASIC,
        PAGES_READ_ENGAGEMENT,
        PAGES_SHOW_LIST,
        INSTAGRAM_MANAGE_COMMENTS,
        BUSINESS_MANAGEMENT,
    ],
    instagram_mentions_enabled: [
        INSTAGRAM_BASIC,
        INSTAGRAM_MANAGE_COMMENTS,
        PAGES_READ_ENGAGEMENT,
        PAGES_SHOW_LIST,
        BUSINESS_MANAGEMENT,
    ],
    instagram_ads_enabled: [
        INSTAGRAM_BASIC,
        PAGES_READ_ENGAGEMENT,
        PAGES_SHOW_LIST,
        INSTAGRAM_MANAGE_COMMENTS,
        ADS_MANAGEMENT,
        ADS_READ,
        BUSINESS_MANAGEMENT,
    ],
    instagram_direct_message_enabled: [
        INSTAGRAM_BASIC,
        PAGES_MANAGE_METADATA,
        INSTAGRAM_MANAGE_MESSAGES,
    ],
    recommendations_enabled: [
        PAGES_MANAGE_ENGAGEMENT,
        PAGES_READ_USER_CONTENT,
        PAGES_SHOW_LIST,
    ],
}

// TASKS in FB documentation
// https://developers.facebook.com/docs/pages/overview/permissions-features#tasks
export enum FacebookRole {
    Advertise = 'ADVERTISE',
    Analyze = 'ANALYZE',
    CreateContent = 'CREATE_CONTENT',
    Manage = 'MANAGE',
    Moderate = 'MODERATE',
}
export const ADVERTISE_ROLE = 'ADVERTISE'
export const ANALYZE_ROLE = 'ANALYZE'
export const CREATE_CONTENT_ROLE = 'CREATE_CONTENT'
export const MANAGE_ROLE = 'MANAGE'
export const MODERATE_ROLE = 'MODERATE'

// User types in FB documentation
// https://developers.facebook.com/docs/pages/overview/permissions-features
export enum FacebookUserType {
    Admin = 'Admin',
    Advertiser = 'Advertiser',
    Analyst = 'Analyst',
    Editor = 'Editor',
    Moderator = 'Moderator',
}
const ADMIN_USER_TYPE = {
    name: FacebookUserType.Admin,
    roles: Object.values(FacebookRole),
}
const ADVERTISER_USER_TYPE = {
    name: FacebookUserType.Advertiser,
    roles: [FacebookRole.Advertise, FacebookRole.Analyze],
}
const ANALYST_USER_TYPE = {
    name: FacebookUserType.Analyst,
    roles: [FacebookRole.Analyze],
}
const EDITOR_USER_TYPE = {
    name: FacebookUserType.Editor,
    roles: [
        FacebookRole.Advertise,
        FacebookRole.Analyze,
        FacebookRole.CreateContent,
        FacebookRole.Moderate,
    ],
}
const MODERATOR_USER_TYPE = {
    name: FacebookUserType.Moderator,
    roles: [
        FacebookRole.Advertise,
        FacebookRole.Analyze,
        FacebookRole.Moderate,
    ],
}

// Ordered by number of roles high to low
export const FACEBOOK_USER_TYPES = [
    ADMIN_USER_TYPE,
    EDITOR_USER_TYPE,
    MODERATOR_USER_TYPE,
    ADVERTISER_USER_TYPE,
    ANALYST_USER_TYPE,
]

/**
 * Check if provided all the userRoles are the same with all the roles of a certain
 * user type and return it's name
 */
export function getFacebookUserTypeByRoles(userRoles: FacebookRole[]) {
    if (!userRoles) {
        return
    }

    for (const userType of FACEBOOK_USER_TYPES) {
        let counter = 0

        userType.roles.forEach((el) => {
            if (userRoles.includes(el)) {
                counter++
            }
        })

        if (counter === userType.roles.length) {
            return userType.name
        }
    }

    return 'Custom/Unknown'
}

/**
 * Check if has role
 */
export function hasFacebookRole(
    userRoles: FacebookRole[],
    roleToSearch: FacebookRole
) {
    if (!userRoles) {
        return false
    }

    return userRoles.includes(roleToSearch)
}

/**
 * Return if the user has the right permissions to be able to enable meta settings
 */
export function canEnableMetaSetting(
    userPermissions: string[],
    metaSetting: string
) {
    if (!userPermissions) {
        return false
    }

    // eslint-disable-next-line no-prototype-builtins
    if (!PERMISSIONS_PER_INTEGRATION_META_SETTING.hasOwnProperty(metaSetting)) {
        return false
    }

    let counter = 0
    PERMISSIONS_PER_INTEGRATION_META_SETTING[
        metaSetting as keyof typeof PERMISSIONS_PER_INTEGRATION_META_SETTING
    ].forEach((metaSettingPermission) => {
        if (userPermissions.includes(metaSettingPermission)) {
            counter++
        }
    })

    return (
        counter ===
        PERMISSIONS_PER_INTEGRATION_META_SETTING[
            metaSetting as keyof typeof PERMISSIONS_PER_INTEGRATION_META_SETTING
        ].length
    )
}

export const InstagramDMSettingStatus = {
    SHOULD_RECONNECT: -1,
    NOT_ALLOWED: 0,
    ALLOWED: 1,
}

export function getInstagramDMSettingStatus(
    canEnableInstagramDirectMessage: boolean,
    integration: Map<any, any>
) {
    if (!canEnableInstagramDirectMessage) {
        // User did not grant the permission so he should reconnect
        return InstagramDMSettingStatus.SHOULD_RECONNECT
    }

    const instagramDMAllowed = integration.getIn([
        'meta',
        'instagram',
        'instagram_direct_message_allowed',
    ])

    if (typeof instagramDMAllowed === 'undefined') {
        // We don't know. User should reconnect so we can query the conversation API
        // and set `instagram_direct_message_allowed` in the integration's meta
        return InstagramDMSettingStatus.SHOULD_RECONNECT
    } else if (instagramDMAllowed === true) {
        return InstagramDMSettingStatus.ALLOWED
    }
    return InstagramDMSettingStatus.NOT_ALLOWED
}

export function getInstagramDMSettingsInlineComponent(
    instagramDMSettingStatus: number,
    currentAccount: Map<any, any>,
    currentPlan: Map<any, any>
) {
    const currentPlanHasInstagramDMFeature = currentPlan.getIn([
        'features',
        AccountFeature.InstagramDirectMessage,
        'enabled',
    ])

    if (!currentPlanHasInstagramDMFeature) {
        const segmentEventToSend = {
            name: SegmentEvent.PaywallUpgradeButtonSelected,
            props: {
                domain: currentAccount.get('domain'),
                current_plan: currentPlan.get('name'),
                paywall_feature: AccountFeature.InstagramDirectMessage,
            },
        }

        return (
            <UpgradeButton
                size="sm"
                hasInvertedColors={true}
                className="ml-1 py-0 px-1"
                segmentEventToSend={segmentEventToSend}
            />
        )
    }

    if (
        instagramDMSettingStatus === InstagramDMSettingStatus.SHOULD_RECONNECT
    ) {
        return (
            <Alert color="warning" className="ml-1 py-1 mt-3">
                Reconnect your integration to grant us the permissions to access
                the Messenger API for Instagram on your behalf
            </Alert>
        )
    } else if (
        instagramDMSettingStatus === InstagramDMSettingStatus.NOT_ALLOWED
    ) {
        return (
            <Alert color="warning" className="ml-1 py-1 mt-3">
                To activate Instagram Messaging, please click the green{' '}
                <b>Reconnect</b> button. If this message persists, please check
                that you have enabled the{' '}
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://docs.gorgias.com/instagram/instagram-direct-messages#how_do_i_check_if_i_have_enabled_the_allow_access_to_messages_setting_in_instagram"
                >
                    Allow Access to Messages setting
                </a>{' '}
                in your Instagram app and then reconnect your integration. If
                this messages still persists, please reach out to{' '}
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="mailto:support@gorgias.com"
                >
                    our support team
                </a>{' '}
                or contact us via chat.
            </Alert>
        )
    }

    return <></>
}
