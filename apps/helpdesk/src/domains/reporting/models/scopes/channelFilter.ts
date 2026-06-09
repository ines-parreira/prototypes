import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type {
    Context,
    ScopeFilters,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'

export const EMAIL_AND_CONTACT_FORM_CHANNELS = ['email', 'contact_form']

/**
 * Builds the scope filters for a query while forcing a fixed `channel` filter,
 * so a base query can scope itself to a set of channels directly (e.g. the
 * Channels › Email dashboard, fixed to email + contact_form). The forced
 * channels replace any channel filter coming from the context.
 */
export const getChannelScopeFilters = <TMeta extends ScopeMeta>(
    channels: string[],
    ctx: Context<TMeta>,
    config: TMeta,
): ScopeFilters<TMeta> =>
    createScopeFilters(
        { ...ctx.filters, channels: withDefaultLogicalOperator(channels) },
        config,
    )

export const getEmailChannelScopeFilters = <TMeta extends ScopeMeta>(
    ctx: Context<TMeta>,
    config: TMeta,
): ScopeFilters<TMeta> =>
    getChannelScopeFilters(EMAIL_AND_CONTACT_FORM_CHANNELS, ctx, config)
