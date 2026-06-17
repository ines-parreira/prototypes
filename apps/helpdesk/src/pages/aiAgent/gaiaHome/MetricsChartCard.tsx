import { useState } from 'react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts'
import { Button, Icon } from '@gorgias/axiom'

import css from './GaiaHomePage.less'

type IconName = 'trending-up' | 'chart-bar-vertical'

const METRIC_OPTIONS: { name: string; icon: IconName }[] = [
    { name: 'Automation rate', icon: 'trending-up' },
    { name: 'Customer satisfaction', icon: 'chart-bar-vertical' },
    { name: 'Resolution time', icon: 'chart-bar-vertical' },
    { name: 'Ticket volume', icon: 'chart-bar-vertical' },
    { name: 'First response time', icon: 'trending-up' },
    { name: 'Revenue impact', icon: 'trending-up' },
]

const CHART_DATA = [
    { date: 'Jun 1', value: 19 },
    { date: 'Jun 2', value: 12 },
    { date: 'Jun 3', value: 20 },
    { date: 'Jun 4', value: 31 },
    { date: 'Jun 5', value: 36 },
    { date: 'Jun 6', value: 24 },
    { date: 'Jun 7', value: 30 },
]

const INITIAL_CARDS = [
    { id: 0, label: 'Metric name', value: '0$', delta: '8%' },
    { id: 1, label: 'Metric name', value: '0$', delta: '8%' },
    { id: 2, label: 'Metric name', value: '0$', delta: '8%' },
]

export function MetricsChartCard() {
    const [cards, setCards] = useState(INITIAL_CARDS)
    // Which card is hovered — drives the chart overlay + active styling.
    const [activeId, setActiveId] = useState<number | null>(null)
    // Which card's metric picker is open — driven by hovering its pencil icon.
    const [pickerId, setPickerId] = useState<number | null>(null)
    const [search, setSearch] = useState('')

    const close = () => {
        setActiveId(null)
        setPickerId(null)
        setSearch('')
    }

    const openPicker = (id: number) => {
        setSearch('')
        setPickerId(id)
    }

    const selectMetric = (cardId: number, name: string) => {
        setCards((current) =>
            current.map((card) =>
                card.id === cardId ? { ...card, label: name } : card,
            ),
        )
        setPickerId(null)
        setSearch('')
    }

    const activeCard = cards.find((card) => card.id === activeId)

    const filteredOptions = METRIC_OPTIONS.filter((option) =>
        option.name.toLowerCase().includes(search.trim().toLowerCase()),
    )

    return (
        <div
            className={`${css.chartCard} ${activeCard ? css.chartCardActive : ''}`}
            onMouseLeave={close}
        >
            <div className={css.metricsRow}>
                {cards.map((card) => {
                    const isActive = activeId === card.id
                    const isPickerOpen = pickerId === card.id
                    return (
                        <div
                            key={card.id}
                            className={`${css.metricCard} ${
                                isActive ? css.metricCardActive : ''
                            }`}
                            onMouseEnter={() => setActiveId(card.id)}
                            onMouseLeave={() => setPickerId(null)}
                        >
                            <div className={css.metricCardHeader}>
                                <span className={css.metricLabel}>
                                    {card.label}
                                </span>
                                <span
                                    className={css.metricEdit}
                                    onMouseEnter={() => openPicker(card.id)}
                                >
                                    <Icon name="edit-pencil" size="xs" />
                                </span>
                            </div>

                            <div className={css.metricValueRow}>
                                <span className={css.metricValue}>
                                    {card.value}
                                </span>
                                <span className={css.metricDelta}>
                                    <Icon name="trending-up" size="xs" />
                                    {card.delta}
                                </span>
                            </div>

                            {isPickerOpen && (
                                <div className={css.metricDropdown}>
                                    <div className={css.metricSearchRow}>
                                        <Icon
                                            name="magnifying-glass"
                                            size="sm"
                                        />
                                        <input
                                            className={css.metricSearchInput}
                                            placeholder="Search metrics..."
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                        />
                                    </div>
                                    <div className={css.metricOptionList}>
                                        {filteredOptions.map((option) => (
                                            <button
                                                key={option.name}
                                                type="button"
                                                className={css.metricOption}
                                                onClick={() =>
                                                    selectMetric(
                                                        card.id,
                                                        option.name,
                                                    )
                                                }
                                            >
                                                <Icon
                                                    name={option.icon}
                                                    size="sm"
                                                />
                                                {option.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {activeCard && (
                <div className={css.chartOverlay}>
                    <div className={css.chartHeader}>
                        <div className={css.chartHeaderLeft}>
                            <div className={css.chartTitleRow}>
                                <span className={css.chartTitle}>
                                    {activeCard.label}
                                </span>
                                <Icon name="dots-kebab-vertical" size="sm" />
                            </div>
                            <div className={css.metricValueRow}>
                                <span className={css.metricValue}>0</span>
                                <span className={css.metricDelta}>
                                    <Icon name="trending-up" size="xs" />
                                    2%
                                </span>
                            </div>
                        </div>
                        <Button
                            intent="secondary"
                            size="sm"
                            trailingSlot={
                                <Icon name="arrow-chevron-down" size="sm" />
                            }
                        >
                            Overall
                        </Button>
                    </div>

                    <div className={css.chart}>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart
                                data={CHART_DATA}
                                margin={{
                                    top: 8,
                                    right: 8,
                                    bottom: 0,
                                    left: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="gaiaChartGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="currentColor"
                                            stopOpacity={0.18}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="currentColor"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#E6E6E6"
                                />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fontSize: 12,
                                        fill: '#8A8A8A',
                                    }}
                                />
                                <YAxis
                                    domain={[0, 50]}
                                    ticks={[0, 10, 20, 30, 40, 50]}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `${value}%`}
                                    tick={{
                                        fontSize: 12,
                                        fill: '#8A8A8A',
                                    }}
                                    width={44}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    fill="url(#gaiaChartGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    )
}
