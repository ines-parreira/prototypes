type RuleActionFailureSeverity = 'warning' | 'error'

type RuleActionFailure = {
    description: string
    severity: RuleActionFailureSeverity
}

type RuleFailedActionPayload = {
    action_name: string
    failure_reason: string
}

export type RuleFailedActionDisplay = {
    actionName: string
    failureDescription: string
    failureSeverity: RuleActionFailureSeverity
}

const RULE_ACTIONS_FAILURES: Record<string, RuleActionFailure> = {
    'already-applied': {
        description: 'The action was already applied.',
        severity: 'warning',
    },
    'csat-already-sent': {
        description: 'CSAT has already been sent for this ticket.',
        severity: 'error',
    },
    'missing-help-center': {
        description:
            'The connected help-center has either been deactivated or deleted.',
        severity: 'error',
    },
    'user-not-found': {
        description: 'Could not find the agent to assign this ticket to.',
        severity: 'error',
    },
    'integration-not-found': {
        description:
            'The integration used to send the email was deactivated or deleted.',
        severity: 'error',
    },
    'no-recipient': {
        description: 'The recipient of the email was not specified.',
        severity: 'warning',
    },
    'auto-submitted': {
        description: 'Cannot auto-reply to an auto-generated message.',
        severity: 'warning',
    },
    'no-return-path': {
        description:
            'No return-path specified in the header of the previous message.',
        severity: 'warning',
    },
    'not-email': {
        description: 'Can only auto-reply to email messages.',
        severity: 'warning',
    },
    'recent-auto-reply': {
        description:
            'Can only auto-reply to a given customer once every 5 minutes.',
        severity: 'warning',
    },
    'spam-ticket': {
        description: 'Cannot auto-reply to a ticket marked as spam.',
        severity: 'warning',
    },
    'no-autoreply-no-nonagents': {
        description: 'Can only auto-reply to customer messages.',
        severity: 'warning',
    },
    'unanswerable-channel': {
        description: 'The channel of the previous message is not eligible.',
        severity: 'warning',
    },
    'no-snooze-closed-ticket': {
        description: 'Can only snooze an open ticket.',
        severity: 'warning',
    },
    'snooze-datetime-in-past': {
        description: 'Specified snooze date is in the past.',
        severity: 'warning',
    },
    'team-not-found': {
        description: 'Could not find the team to assign this ticket to.',
        severity: 'error',
    },
    'too-many-rule-replies': {
        description: 'Too many auto-replies have been sent by this rule.',
        severity: 'warning',
    },
    'too-many-rule-messages-to-recipient': {
        description:
            'Too many auto-replies have been sent to this recipient by this rule in the past hour.',
        severity: 'warning',
    },
}

const RULE_ACTIONS_DISPLAY_NAMES: Record<string, string> = {
    notify: 'Deliver message',
    sendEmail: 'Send email',
    replyToTicket: 'Reply to customer',
    addInternalNote: 'Add internal note',
    applyMacro: 'Apply macro',
    addTags: 'Add tags',
    removeTags: 'Remove tags',
    setTags: 'Reset tags',
    setSubject: 'Set subject',
    setStatus: 'Set status',
    setPriority: 'Set priority',
    setCustomFieldValue: 'Set ticket field',
    setCustomerCustomFieldValue: 'Set customer field',
    snoozeTicket: 'Snooze for',
    setAssignee: 'Assign agent',
    setTeamAssignee: 'Assign team',
    trashTicket: 'Delete ticket',
    facebookHideComment: 'Hide Facebook comment',
    facebookLikeComment: 'Like Facebook comment',
    excludeFromAutoMerge: 'Exclude ticket from Auto-Merge',
    excludeFromCSAT: 'Exclude ticket from CSAT',
    'auto-reply-faq-questions': 'Help-center article recommendation',
}

export function getRuleFailedActionDisplay(
    action: RuleFailedActionPayload,
): RuleFailedActionDisplay | null {
    const failure = RULE_ACTIONS_FAILURES[action.failure_reason]

    if (!failure) {
        return null
    }

    return {
        actionName:
            RULE_ACTIONS_DISPLAY_NAMES[action.action_name] ??
            action.action_name,
        failureDescription: failure.description,
        failureSeverity: failure.severity,
    }
}

export function getRuleFailedActionsDisplay(
    actions: RuleFailedActionPayload[] | null | undefined,
): RuleFailedActionDisplay[] {
    if (!actions || actions.length === 0) {
        return []
    }

    return actions
        .map((action) => getRuleFailedActionDisplay(action))
        .filter((action): action is RuleFailedActionDisplay => Boolean(action))
}
