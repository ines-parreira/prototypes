import type {
    AnyManagedRuleSettings,
    ManagedRule,
    RuleDraft,
} from 'state/rules/types'
import { ManagedRulesSlugs, RuleType } from 'state/rules/types'

import type { RuleItemActions } from '../../types'
import type { InstallationError } from '../constants'
import { AutoCloseSpamModal } from './installationModals/AutoCloseSpamModal'
import { AutoReplyFAQModal } from './installationModals/AutoReplyFAQModal'
import { AutoReplyReturnModal } from './installationModals/AutoReplyReturnModal'
import { AutoReplyWismoModal } from './installationModals/AutoReplyWismoModal'
import { DefaultModal } from './installationModals/DefaultModal'

type Props = {
    handleRule: RuleItemActions
    triggeredCount: number
    rule: RuleDraft | ManagedRule
    recipeSlug: string
    viewCreationCheckbox: () => React.ReactNode
    handleInstallationError: (errors: InstallationError) => void
    handleDefaultSettings: (settings: Partial<AnyManagedRuleSettings>) => void
    aiAgentLink?: string
}

export type DefaultModalProps = Pick<
    Props,
    'recipeSlug' | 'triggeredCount' | 'viewCreationCheckbox' | 'aiAgentLink'
>

export type ManagedRuleModalProps = Omit<Props, 'handleRule'>

export const InstallRuleModalBody = (props: Props) => {
    const { rule } = props
    const installationModals: {
        [ManagedRulesSlugs.AutoCloseSpam]: typeof AutoCloseSpamModal
        [ManagedRulesSlugs.AutoReplyWismo]: typeof AutoReplyWismoModal
        [ManagedRulesSlugs.AutoReplyFAQ]: typeof AutoReplyFAQModal
        [ManagedRulesSlugs.AutoReplyReturn]: typeof AutoReplyReturnModal
    } = {
        [ManagedRulesSlugs.AutoCloseSpam]: AutoCloseSpamModal,
        [ManagedRulesSlugs.AutoReplyWismo]: AutoReplyWismoModal,
        [ManagedRulesSlugs.AutoReplyFAQ]: AutoReplyFAQModal,
        [ManagedRulesSlugs.AutoReplyReturn]: AutoReplyReturnModal,
    }

    const Component =
        rule.type === RuleType.Managed
            ? installationModals[(rule as ManagedRule).settings.slug]
            : DefaultModal
    return <Component {...props} />
}

export default InstallRuleModalBody
