import React from 'react'

import {
    RuleDraft,
    ManagedRulesSlugs,
    ManagedRule,
    RuleType,
    AnyManagedRuleSettings,
} from 'state/rules/types'
import {RuleItemActions} from '../../types'
import {InstallationError} from '../constants'
import {DefaultModal} from './installationModals/DefaultModal'
import {AutoCloseSpamModal} from './installationModals/AutoCloseSpamModal'
import {AutoReplyWismoModal} from './installationModals/AutoReplyWismoModal'
import {AutoReplyFAQModal} from './installationModals/AutoReplyFAQModal'

type Props = {
    handleRule: RuleItemActions
    triggeredCount: number
    rule: RuleDraft | ManagedRule
    recipeSlug: string
    viewCreationCheckbox: () => React.ReactNode
    handleInstallationError: (errors: InstallationError) => void
    handleDefaultSettings: (settings: Partial<AnyManagedRuleSettings>) => void
}

export type DefaultModalProps = Pick<
    Props,
    'recipeSlug' | 'triggeredCount' | 'viewCreationCheckbox'
>

export type ManagedRuleModalProps = Omit<Props, 'handleRule'>

export const InstallRuleModalBody = (props: Props) => {
    const {rule} = props
    const installationModals: {
        [ManagedRulesSlugs.AutoCloseSpam]: typeof AutoCloseSpamModal
        [ManagedRulesSlugs.AutoReplyWismo]: typeof AutoReplyWismoModal
        [ManagedRulesSlugs.AutoReplyFAQ]: typeof AutoReplyFAQModal
    } = {
        [ManagedRulesSlugs.AutoCloseSpam]: AutoCloseSpamModal,
        [ManagedRulesSlugs.AutoReplyWismo]: AutoReplyWismoModal,
        [ManagedRulesSlugs.AutoReplyFAQ]: AutoReplyFAQModal,
    }

    const Component =
        rule.type === RuleType.Managed
            ? installationModals[(rule as ManagedRule).settings.slug]
            : DefaultModal
    return <Component {...props} />
}

export default InstallRuleModalBody
