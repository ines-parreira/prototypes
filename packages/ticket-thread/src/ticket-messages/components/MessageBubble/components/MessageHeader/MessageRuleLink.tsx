import { useGetRule } from '@gorgias/helpdesk-queries'
import type { Rule } from '@gorgias/helpdesk-queries'

import { MessageMetaLabel } from './MessageMetaLabel'
import { MessageMetaLink } from './MessageMetaLink'

const managedRuleDisplayNames: Record<string, string> = {
    'auto-reply-faq-questions': '[Auto Reply] Article recommendation (Email)',
    'auto-reply-return-request': '[Auto Reply] Automate return request emails',
    'auto-reply-wismo': '[Auto Reply] Send tracking information email',
    'non-support-related-emails': '[Auto Close] Auto-close spam emails',
}

function getRuleSettingsSlug(settings: Rule['settings']) {
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
        return undefined
    }

    const slug = (settings as Record<string, unknown>).slug

    return typeof slug === 'string' ? slug : undefined
}

function getRuleDisplayName(rule?: Rule) {
    if (!rule) return 'Rule'

    const ruleName = rule.name ?? 'Rule'
    const settingsSlug = getRuleSettingsSlug(rule.settings)

    if (rule.type === 'managed' && settingsSlug) {
        return managedRuleDisplayNames[settingsSlug] ?? ruleName
    }

    return ruleName
}

type MessageRuleLinkProps = {
    ruleId: number | string
}

export function MessageRuleLink({ ruleId }: MessageRuleLinkProps) {
    const numericRuleId = Number(ruleId)
    const { data: ruleResponse } = useGetRule(numericRuleId, {
        query: {
            enabled: Number.isFinite(numericRuleId),
            staleTime: Infinity,
        },
    })

    return (
        <MessageMetaLabel>
            sent via{' '}
            <MessageMetaLink to={`/app/settings/rules/${ruleId}`}>
                {getRuleDisplayName(ruleResponse?.data)}
            </MessageMetaLink>
        </MessageMetaLabel>
    )
}
