import {
    getRuleFailedActionDisplay,
    getRuleFailedActionsDisplay,
} from '../ruleFailureTransforms'

describe('ruleFailureTransforms', () => {
    it('maps known action names and failure reasons to legacy wording', () => {
        expect(
            getRuleFailedActionDisplay({
                action_name: 'setAssignee',
                failure_reason: 'user-not-found',
            }),
        ).toEqual({
            actionName: 'Assign agent',
            failureDescription:
                'Could not find the agent to assign this ticket to.',
            failureSeverity: 'error',
        })
    })

    it('keeps the raw action name when no legacy label mapping exists', () => {
        expect(
            getRuleFailedActionDisplay({
                action_name: 'customAction',
                failure_reason: 'recent-auto-reply',
            }),
        ).toEqual({
            actionName: 'customAction',
            failureDescription:
                'Can only auto-reply to a given customer once every 5 minutes.',
            failureSeverity: 'warning',
        })
    })

    it('filters out failed actions with unknown failure reasons', () => {
        expect(
            getRuleFailedActionDisplay({
                action_name: 'setAssignee',
                failure_reason: 'unknown-reason',
            }),
        ).toBeNull()
    })

    it('maps already-applied failures for customer field actions', () => {
        expect(
            getRuleFailedActionDisplay({
                action_name: 'setCustomerCustomFieldValue',
                failure_reason: 'already-applied',
            }),
        ).toEqual({
            actionName: 'Set customer field',
            failureDescription: 'The action was already applied.',
            failureSeverity: 'warning',
        })
    })

    it('returns only displayable failures for a failed actions list', () => {
        expect(
            getRuleFailedActionsDisplay([
                {
                    action_name: 'applyMacro',
                    failure_reason: 'recent-auto-reply',
                },
                {
                    action_name: 'setAssignee',
                    failure_reason: 'unknown-reason',
                },
            ]),
        ).toEqual([
            {
                actionName: 'Apply macro',
                failureDescription:
                    'Can only auto-reply to a given customer once every 5 minutes.',
                failureSeverity: 'warning',
            },
        ])
    })
})
