import Clarity from '@microsoft/clarity'
import { FeatureFlagKey, fetchFlag } from '@repo/feature-flags'
import { UserRole } from '@repo/permissions'
import { isProduction, isStaging } from '@repo/utils'

const CLARITY_PROJECT_ID = 'wgwg1vy3fk'

export type ClarityUser = {
    id?: number | string | null
    role?: { name?: string | null } | null
    language?: string | null
    created_datetime?: string | null
}

export type ClarityAccount = {
    id?: number | string | null
    domain?: string | null
    created_datetime?: string | null
}

export type ClarityContext = {
    user?: ClarityUser | null
    account?: ClarityAccount | null
    helpdeskPriceId?: string | null
    automationPriceId?: string | null
}

function logClarityDebug(...args: Array<unknown>) {
    if (!isProduction()) {
        // eslint-disable-next-line no-console
        console.log(...args)
    }
}

function toStringOrNull(value: unknown): string | null {
    if (value === null || value === undefined) return null
    if (typeof value === 'string') return value.length > 0 ? value : null
    if (typeof value === 'number' && Number.isFinite(value))
        return String(value)
    if (typeof value === 'boolean') return String(value)
    return null
}

function safeSetTag(key: string, value: string | null | undefined) {
    if (value === null || value === undefined || value === '') return
    try {
        Clarity.setTag(key, value)
    } catch (err) {
        logClarityDebug('[Clarity] setTag failed', { key, err })
    }
}

function isInternalUser(roleName: string | null): boolean {
    if (window.USER_IMPERSONATED) return true
    return roleName === UserRole.GorgiasAgent
}

export function buildClarityTags(ctx: ClarityContext): Record<string, string> {
    const tags: Record<string, string> = {}

    const accountId = toStringOrNull(ctx.account?.id)
    const accountDomain = toStringOrNull(ctx.account?.domain)
    const userId = toStringOrNull(ctx.user?.id)
    const roleName = toStringOrNull(ctx.user?.role?.name)

    if (accountId) tags.account_id = accountId
    if (accountDomain) tags.account_domain = accountDomain
    if (userId) tags.user_id = userId
    if (roleName) tags.user_role = roleName

    tags.user_type = isInternalUser(roleName) ? 'internal' : 'external'
    tags.impersonated = String(Boolean(window.USER_IMPERSONATED))

    const cluster = toStringOrNull(window.GORGIAS_CLUSTER)
    if (cluster) tags.cluster = cluster

    tags.env = isProduction()
        ? 'production'
        : isStaging()
          ? 'staging'
          : 'development'

    const release = toStringOrNull(window.GORGIAS_RELEASE)
    if (release) tags.app_version = release

    const userLanguage = toStringOrNull(ctx.user?.language)
    if (userLanguage) tags.user_language = userLanguage

    const accountCreated = toStringOrNull(ctx.account?.created_datetime)
    if (accountCreated) tags.account_created_at = accountCreated

    const helpdeskPriceId = toStringOrNull(ctx.helpdeskPriceId)
    if (helpdeskPriceId) tags.helpdesk_price_id = helpdeskPriceId

    const automationPriceId = toStringOrNull(ctx.automationPriceId)
    if (automationPriceId) tags.automation_price_id = automationPriceId

    return tags
}

function applyClarityContext(ctx: ClarityContext) {
    const accountId = toStringOrNull(ctx.account?.id)
    const accountDomain = toStringOrNull(ctx.account?.domain)

    if (accountId) {
        try {
            Clarity.identify(
                accountId,
                undefined,
                undefined,
                accountDomain ?? undefined,
            )
        } catch (err) {
            logClarityDebug('[Clarity] identify failed', err)
        }
    }

    const tags = buildClarityTags(ctx)
    for (const [key, value] of Object.entries(tags)) {
        safeSetTag(key, value)
    }
    logClarityDebug('[Clarity] tags applied', tags)
}

export async function initClarity(ctx: ClarityContext = {}) {
    if (!isStaging() && !isProduction()) {
        logClarityDebug('[Clarity] skipped: unsupported environment')
        return
    }

    const { flag: isClarityEnabled, error } = await fetchFlag(
        FeatureFlagKey.HelpdeskMicrosoftClarity,
        false,
    )

    logClarityDebug('[Clarity] flag evaluation', {
        error: error?.message ?? null,
        isClarityEnabled,
        projectId: CLARITY_PROJECT_ID,
    })

    if (!isClarityEnabled) {
        logClarityDebug('[Clarity] skipped: flag disabled')
        return
    }

    try {
        Clarity.init(CLARITY_PROJECT_ID)
        logClarityDebug('[Clarity] init succeeded', {
            projectId: CLARITY_PROJECT_ID,
        })
    } catch (initError) {
        logClarityDebug('[Clarity] init failed', initError)
        return
    }

    applyClarityContext(ctx)
}
