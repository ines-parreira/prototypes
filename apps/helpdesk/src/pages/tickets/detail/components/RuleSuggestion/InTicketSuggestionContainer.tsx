import { FeatureFlagKey } from '@repo/feature-flags'
import classNames from 'classnames'

import { useFlag } from 'core/flags'
import DEPRECATED_Avatar from 'pages/common/components/Avatar/Avatar'
import { Avatar } from 'pages/tickets/detail/components/TicketMessages/Avatar'
import { assetsUrl } from 'utils'

import css from './InTicketSuggestionContainer.less'

type Props = {
    children?: React.ReactNode
    isAIAgent?: boolean
}

export default function InTicketSuggestionContainer({
    children,
    isAIAgent = false,
}: Props) {
    const hasTicketThreadRevamp = useFlag(FeatureFlagKey.TicketThreadRevamp)

    return (
        <div
            className={classNames(css.container, {
                [css.aiAgentContainer]: isAIAgent,
            })}
        >
            <div className={css.avatar}>
                {hasTicketThreadRevamp ? (
                    <Avatar
                        isAIAgent={isAIAgent}
                        name={isAIAgent ? 'AI Agent' : 'Gorgias Tips'}
                        url={assetsUrl(
                            '/img/icons/gorgias-icon-logo-white.png',
                        )}
                    />
                ) : (
                    <DEPRECATED_Avatar
                        isAIAgent={isAIAgent}
                        name={isAIAgent ? 'AI Agent' : 'Gorgias Tips'}
                        size={36}
                        url={assetsUrl(
                            '/img/icons/gorgias-icon-logo-white.png',
                        )}
                    />
                )}
            </div>
            {children}
        </div>
    )
}
