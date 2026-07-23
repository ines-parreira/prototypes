import { useState } from 'react'
import { Button, Icon } from '@gorgias/axiom'

import css from './GaiaHomePage.less'

type IconName = 'chart-bar-vertical' | 'book-open' | 'zap' | 'light-bulb'

type Category = {
    id: string
    label: string
    icon: IconName
    starters: string[]
}

// Prototype content — realistic conversation starters per category so the
// hover reveal feels real during demos.
const CATEGORIES: Category[] = [
    {
        id: 'analytics',
        label: 'Analytics',
        icon: 'chart-bar-vertical',
        starters: [
            'How did my CSAT change this month?',
            'Which channels drive the most tickets?',
            'Show me first response time trends',
        ],
    },
    {
        id: 'knowledge',
        label: 'Knowledge',
        icon: 'book-open',
        starters: [
            'What help center articles are missing?',
            'Summarize my current return policy',
            'Which articles underperform with customers?',
        ],
    },
    {
        id: 'optimize',
        label: 'Optimize',
        icon: 'zap',
        starters: [
            'Where can I automate more replies?',
            'Suggest macros for my common questions',
            "What's slowing down my resolution time?",
        ],
    },
]

type Props = {
    onStarterClick: (starter: string) => void
}

export function CategoryLauncher({ onStarterClick }: Props) {
    const [activeId, setActiveId] = useState<string | null>(null)

    const activeCategory = CATEGORIES.find(
        (category) => category.id === activeId,
    )

    return (
        <div className={css.launcher} onMouseLeave={() => setActiveId(null)}>
            <div className={css.chipsRow}>
                {CATEGORIES.map((category) => (
                    <span
                        key={category.id}
                        className={css.chipWrap}
                        onMouseEnter={() => setActiveId(category.id)}
                        onFocus={() => setActiveId(category.id)}
                    >
                        <Button
                            variant="secondary"
                            size="md"
                            leadingSlot={
                                <Icon name={category.icon} size="sm" />
                            }
                        >
                            {category.label}
                        </Button>
                    </span>
                ))}
            </div>

            <div
                className={`${css.starters} ${activeCategory ? css.startersOpen : ''}`}
            >
                {activeCategory?.starters.map((starter) => (
                    <button
                        key={starter}
                        type="button"
                        className={css.starterItem}
                        onClick={() => onStarterClick(starter)}
                    >
                        {starter}
                    </button>
                ))}
            </div>
        </div>
    )
}
