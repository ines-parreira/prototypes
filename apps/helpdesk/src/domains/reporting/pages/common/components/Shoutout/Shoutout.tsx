import type { ReactNode } from 'react'
import React, { Fragment, useMemo, useRef } from 'react'

import classNames from 'classnames'
import isNil from 'lodash/isNil'

import { Card } from '@gorgias/analytics-ui-kit'
import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import css from 'domains/reporting/pages/common/components/Shoutout/Shoutout.less'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import Avatar from 'pages/common/components/Avatar/Avatar'

type Props = {
    persons: ShoutoutPerson[]
    multiplePersonsLabel: ReactNode | ((count: number) => ReactNode)
    metricName: string
    value: ReactNode
    maxTooltipPersons?: number
}

interface ShoutoutPerson {
    image?: Maybe<string>
    name: string
}

export const SHOUTOUT_MAX_PERSONS = 5
export const SHOUTOUT_HEIGHT_PX = 82
export const SHOUTOUT_NO_VALUE_PLACEHOLDER = '-'

export default function Shoutout({
    persons,
    multiplePersonsLabel,
    metricName,
    value,
    maxTooltipPersons = SHOUTOUT_MAX_PERSONS,
    chartId,
    dashboard,
}: Props & DashboardChartProps) {
    const tooltipRef = useRef<HTMLElement>(null)

    const moreThanOnePerson = persons.length > 1
    const firstPerson: ShoutoutPerson | undefined = persons[0]

    const getLabel = () => {
        if (persons.length === 0) return SHOUTOUT_NO_VALUE_PLACEHOLDER
        if (moreThanOnePerson)
            return multiplePersonsLabel instanceof Function
                ? (multiplePersonsLabel(persons.length) as ReactNode)
                : multiplePersonsLabel

        return firstPerson?.name
    }

    const tooltipPersons = useMemo(
        () => persons.slice(0, maxTooltipPersons),
        [maxTooltipPersons, persons],
    )
    const personsLengthExceeded = persons.length > maxTooltipPersons

    return (
        <Card className={css.card}>
            <div className={css.wrapper}>
                <div className={css.avatar}>
                    {persons.length !== 1 ? (
                        <div className={css.avatarPlaceholder}>
                            {!persons.length ? (
                                <span className={css.noValuePlaceholder}>
                                    {SHOUTOUT_NO_VALUE_PLACEHOLDER}
                                </span>
                            ) : (
                                <i className="material-icons">people</i>
                            )}
                        </div>
                    ) : (
                        <Avatar
                            name={firstPerson?.name}
                            size={48}
                            url={firstPerson?.image}
                            shape="round"
                        />
                    )}
                </div>
                <div className={css.content}>
                    <div
                        className={css.label}
                        aria-label={`Agents' information for ${metricName}`}
                    >
                        {getLabel()}{' '}
                        {moreThanOnePerson && (
                            <>
                                <i
                                    ref={tooltipRef}
                                    className={classNames(
                                        'material-icons',
                                        css.infoIcon,
                                    )}
                                    aria-label="Hover to display more people"
                                >
                                    info_outline
                                </i>
                                <Tooltip
                                    boundariesElement="window"
                                    target={tooltipRef}
                                    autohide={false}
                                    placement="top-start"
                                    delay={{ show: 0, hide: 500 }}
                                >
                                    {tooltipPersons.map(
                                        (person, idx, source) => (
                                            <Fragment key={idx}>
                                                {person.name}
                                                {idx !== source.length - 1 && (
                                                    <>
                                                        ; <br />
                                                    </>
                                                )}
                                            </Fragment>
                                        ),
                                    )}
                                    {personsLengthExceeded && (
                                        <>
                                            ; <br />
                                            {persons.length -
                                                maxTooltipPersons}{' '}
                                            more...
                                        </>
                                    )}
                                </Tooltip>
                            </>
                        )}
                    </div>
                    <div className={css.metricRow}>
                        <div className={css.metricName}>{metricName}</div>
                        <div className={css.metricDivider}></div>
                        <div className={css.metricValue}>
                            {isNil(value)
                                ? SHOUTOUT_NO_VALUE_PLACEHOLDER
                                : value}
                        </div>
                    </div>
                </div>
                {chartId && (
                    <div className={css.actionMenu}>
                        <ChartsActionMenu
                            chartId={chartId}
                            chartName={value}
                            dashboard={dashboard}
                        />
                    </div>
                )}
            </div>
        </Card>
    )
}
