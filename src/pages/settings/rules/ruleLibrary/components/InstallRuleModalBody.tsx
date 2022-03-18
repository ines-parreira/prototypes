import React from 'react'

import {
    RuleDraft,
    ManagedRulesSlugs,
    ManagedRule,
    RuleType,
} from 'state/rules/types'
import {RuleItemActions} from '../../types'
import {DefaultModal} from './installationModals/DefaultModal'
import {AutoCloseSpamModal} from './installationModals/AutoCloseSpamModal'

type Props = {
    handleRule: RuleItemActions
    triggeredCount: number
    rule: RuleDraft | ManagedRule
    isBehindPaywall: boolean
    renderTags: () => React.ReactNode
}

export type DefaultModalProps = Omit<Props, 'isBehindPaywall' & 'renderTags'>

export type ManagedRuleModalProps = Omit<Props, 'handleRule'>

export const InstallRuleModalBody = (props: Props) => {
    const {rule} = props
    const installationModals: {
        [ManagedRulesSlugs.AutoCloseSpam]: typeof AutoCloseSpamModal
    } = {
        [ManagedRulesSlugs.AutoCloseSpam]: AutoCloseSpamModal,
    }

    const Component =
        rule.type === RuleType.Managed
            ? installationModals[(rule as ManagedRule).settings.slug]
            : DefaultModal
    return <Component {...props} />
}

export default InstallRuleModalBody
