import { useMemo } from 'react'

import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'

import {
    Icon,
    LegacyIconButton as IconButton,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import { useTicketInfobarNavigationShortcuts } from '../hooks/useTicketInfobarNavigationShortcuts'

import css from './TicketInfobarNavigation.less'

type TicketInfobarNavigationItem = {
    name: string
    icon: IconName
    onClick: () => void
    tooltip?: {
        title: string
        shortcut: string
    }
}

type Props = {
    hasAIFeedback?: boolean
}

export function TicketInfobarNavigation({ hasAIFeedback }: Props) {
    const { activeTab, isExpanded, onChangeTab, onToggle } =
        useTicketInfobarNavigation()
    useTicketInfobarNavigationShortcuts()

    const items = useMemo(
        (): TicketInfobarNavigationItem[] => [
            {
                name: 'toggle',
                icon: isExpanded ? 'system-bar-collapse' : 'system-bar-expand',
                onClick: () => onToggle(),
                tooltip: {
                    title: isExpanded ? 'Collapse' : 'Expand',
                    shortcut: ']',
                },
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
        [hasAIFeedback, onChangeTab, onToggle, isExpanded],
    )

    return (
        <div className={css.container}>
            {items.map((item) => (
                <Tooltip
                    key={item.name}
                    isDisabled={!item.tooltip}
                    placement="left"
                >
                    <TooltipTrigger>
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
                    </TooltipTrigger>
                    <TooltipContent
                        title={item.tooltip?.title ?? ''}
                        shortcut={item.tooltip?.shortcut}
                    />
                </Tooltip>
            ))}
        </div>
    )
}
