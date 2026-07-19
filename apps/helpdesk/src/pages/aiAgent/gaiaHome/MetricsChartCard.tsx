import { useState } from 'react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts'
import { Button, Icon, ListItem, Select } from '@gorgias/axiom'

import css from './GaiaHomePage.less'

type IconName = 'trending-up' | 'chart-bar-vertical'

const METRIC_OPTIONS: { name: string; icon: IconName }[] = [
    { name: 'Overall automation rate', icon: 'trending-up' },
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
    {
        id: 0,
        label: 'Overall automation rate',
        value: '36%',
        delta: '5%',
        direction: 'up' as const,
    },
    {
        id: 1,
        label: 'Cost saved',
        value: '$1,923.30',
        delta: '10%',
        direction: 'up' as const,
    },
    {
        id: 2,
        label: 'Average CSAT',
        value: '4.1',
        delta: '2%',
        direction: 'down' as const,
    },
]

const RANGE_OPTIONS = [
    { id: '7', label: 'Last 7 days' },
    { id: '30', label: 'Last 30 days' },
    { id: '60', label: 'Last 60 days' },
    { id: '90', label: 'Last 90 days' },
]

const DIMENSION_OPTIONS = [
    { id: 'overall', label: 'Overall' },
    { id: 'channel', label: 'Channel' },
    { id: 'store', label: 'Store' },
    { id: 'feature', label: 'Feature' },
]

const SUGGESTIONS = [
    "What's holding automation rate back from 50%?",
    'Why did cost saved dip after Jun 5?',
    'Is the CSAT dip tied to a specific skill or intent?',
]

export function MetricsChartCard() {
    const [cards, setCards] = useState(INITIAL_CARDS)
    const [activeId, setActiveId] = useState(0)
    // Detail panel is closed on load; hovering a metric card opens it.
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [pickerId, setPickerId] = useState<number | null>(null)
    const [search, setSearch] = useState('')
    const [range, setRange] = useState(RANGE_OPTIONS[0])
    const [dimension, setDimension] = useState(DIMENSION_OPTIONS[0])

    const selectMetric = (cardId: number, name: string) => {
        setCards((current) =>
            current.map((card) =>
                card.id === cardId ? { ...card, label: name } : card,
            ),
        )
        setPickerId(null)
        setSearch('')
    }

    const activeCard = cards.find((card) => card.id === activeId) ?? cards[0]

    const filteredOptions = METRIC_OPTIONS.filter((option) =>
        option.name.toLowerCase().includes(search.trim().toLowerCase()),
    )

    return (
        // Shared hover boundary: wraps the metric cards AND the detail panel,
        // so moving the cursor from a card into the panel never closes it.
        // Leaving this whole element closes the panel (and any open picker).
        <div
            className={`${css.analyticsCard} ${
                isDetailOpen ? css.analyticsCardOpen : ''
            }`}
            onMouseLeave={() => {
                setIsDetailOpen(false)
                setPickerId(null)
            }}
        >
            <div className={css.metricsRow}>
                {cards.map((card) => {
                    // Pressed styling only while the panel is open — never in
                    // the default (closed) state.
                    const isActive = isDetailOpen && activeId === card.id
                    const isPickerOpen = pickerId === card.id
                    return (
                        <div
                            key={card.id}
                            className={`${css.metricCard} ${
                                isActive ? css.metricCardActive : ''
                            }`}
                            data-gaia-selectable
                            data-gaia-label={`${card.label} (${card.value})`}
                            onMouseEnter={() => {
                                setActiveId(card.id)
                                setIsDetailOpen(true)
                            }}
                            onClick={() => setActiveId(card.id)}
                        >
                            <div className={css.metricCardHeader}>
                                <span className={css.metricLabel}>
                                    {card.label}
                                </span>
                                {/* Picker opens only on a deliberate click of
                                    the pencil — never from hovering the metric. */}
                                <span
                                    className={css.metricEdit}
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        setActiveId(card.id)
                                        setPickerId(
                                            isPickerOpen ? null : card.id,
                                        )
                                        setSearch('')
                                    }}
                                >
                                    <Icon name="edit-pencil" size="xs" />
                                </span>
                            </div>

                            <div className={css.metricValueRow}>
                                <span className={css.metricValue}>
                                    {card.value}
                                </span>
                                <span
                                    className={`${css.metricDelta} ${
                                        card.direction === 'down'
                                            ? css.metricDeltaDown
                                            : ''
                                    }`}
                                >
                                    <Icon
                                        name={
                                            card.direction === 'down'
                                                ? 'trending-down'
                                                : 'trending-up'
                                        }
                                        size="xs"
                                    />
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
                                        {filteredOptions.map((option) => {
                                            const selected =
                                                option.name === card.label
                                            return (
                                                <button
                                                    key={option.name}
                                                    type="button"
                                                    className={`${css.metricOption} ${
                                                        selected
                                                            ? css.metricOptionSelected
                                                            : ''
                                                    }`}
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
                                                    <span
                                                        className={
                                                            css.metricOptionLabel
                                                        }
                                                    >
                                                        {option.name}
                                                    </span>
                                                    {selected && (
                                                        <Icon
                                                            name="check"
                                                            size="sm"
                                                        />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {isDetailOpen && (
                <div className={css.detailPanel}>
                    <div className={css.chartHeader}>
                        <span className={css.chartTitle}>
                            {activeCard.label}
                        </span>
                        <div className={css.chartHeaderControls}>
                            <Select
                                aria-label="Time range"
                                size="sm"
                                items={RANGE_OPTIONS}
                                selectedItem={range}
                                onSelect={setRange}
                                trigger={() => (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        trailingSlot={
                                            <Icon
                                                name="arrow-chevron-down"
                                                size="xs"
                                            />
                                        }
                                    >
                                        {range.label}
                                    </Button>
                                )}
                            >
                                {(option) => (
                                    <ListItem
                                        textValue={option.label}
                                        label={option.label}
                                    />
                                )}
                            </Select>
                            <Select
                                aria-label="Breakdown"
                                size="sm"
                                items={DIMENSION_OPTIONS}
                                selectedItem={dimension}
                                onSelect={setDimension}
                                trigger={() => (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        trailingSlot={
                                            <Icon
                                                name="arrow-chevron-down"
                                                size="xs"
                                            />
                                        }
                                    >
                                        {dimension.label}
                                    </Button>
                                )}
                            >
                                {(option) => (
                                    <ListItem
                                        textValue={option.label}
                                        label={option.label}
                                    />
                                )}
                            </Select>
                        </div>
                    </div>

                    <div className={css.chart}>
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart
                                data={CHART_DATA}
                                margin={{
                                    top: 8,
                                    right: 8,
                                    bottom: 8,
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
                                            stopOpacity={0.16}
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
                                    stroke="#E6E1DB"
                                />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={12}
                                    tick={{ fontSize: 12, fill: '#8A8580' }}
                                />
                                <YAxis
                                    domain={[0, 50]}
                                    ticks={[0, 10, 20, 30, 40, 50]}
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => `${value}%`}
                                    tick={{ fontSize: 12, fill: '#8A8580' }}
                                    width={40}
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

                    <div className={css.suggestions}>
                        {SUGGESTIONS.map((suggestion) => (
                            <Button
                                key={suggestion}
                                variant="tertiary"
                                size="sm"
                                leadingSlot={
                                    <Icon
                                        name="arrow-sub-down-right"
                                        size="sm"
                                    />
                                }
                            >
                                {suggestion}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
