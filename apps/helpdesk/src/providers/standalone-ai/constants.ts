import { UserRole } from '@repo/utils'

/**
 * Standalone AI agent accounts should only see a subset of Settings pages.
 * These constants define which routes and sidebar items are blocked.
 *
 * @see CRMGROW-3229
 */

/**
 * Roles that are allowed for standalone AI agent accounts.
 */
export const STANDALONE_AI_ALLOWED_ROLES = new Set<UserRole>([
    UserRole.Admin,
    UserRole.Agent,
    UserRole.ObserverAgent,
])

/**
 * Sidebar item IDs that are hidden for standalone AI agent accounts.
 */
export const STANDALONE_AI_HIDDEN_SIDEBAR_ITEMS = new Set([
    'business-hours',
    'help-center',
    'phone-numbers',
    'voice',
    'sms',
    'contact-form',
    'teams',
    'agent-statuses',
    'http-integration',
    'import-email',
    'import-zendesk',
    'historical-imports',
])
