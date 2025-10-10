import { useMemo } from 'react'

import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'

import { Icon, LegacyIconButton as IconButton } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './TicketInfobarNavigation.less'

type TicketInfobarNavigationItem = {
    name: string
    icon: IconName
    onClick: () => void
}

type Props = {
    hasAIFeedback?: boolean
}

export function TicketInfobarNavigation({ hasAIFeedback }: Props) {
    const { activeTab, isExpanded, onChangeTab, onToggle } =
        useTicketInfobarNavigation()

    const items = useMemo(
        (): TicketInfobarNavigationItem[] => [
            {
                name: 'toggle',
                icon: 'system-bar-right',
                onClick: () => onToggle(),
            },
            {
                name: TicketInfobarTab.Customer,
                icon: 'customer-info',
                onClick: () => {
                    onChangeTab(TicketInfobarTab.Customer)
                },
            },
            ...(hasAIFeedback
                ? [
                      {
                          name: TicketInfobarTab.AIFeedback,
                          icon: 'ai-agent-feedback',
                          onClick: () => {
                              onChangeTab(TicketInfobarTab.AIFeedback)
                          },
                      } satisfies TicketInfobarNavigationItem,
                  ]
                : []),
            {
                name: TicketInfobarTab.AutoQA,
                icon: 'star',
                onClick: () => {
                    onChangeTab(TicketInfobarTab.AutoQA)
                },
            },
        ],
        [hasAIFeedback, onChangeTab, onToggle],
    )

    return (
        <div className={css.container}>
            {items.map((item) => (
                <IconButton
                    key={item.name}
                    className={
                        isExpanded && activeTab === item.name
                            ? css.isActive
                            : undefined
                    }
                    fillStyle="ghost"
                    icon={<Icon name={item.icon} size="md" />}
                    intent="secondary"
                    onClick={item.onClick}
                />
            ))}
        </div>
    )
}
