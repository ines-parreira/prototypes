import React, {useMemo, useRef} from 'react'

import isNil from 'lodash/isNil'

import classNames from 'classnames'
import Avatar from '../Avatar/Avatar'
import Tooltip from '../Tooltip'
import css from './Shoutout.less'

type Props = {
    className?: string
    testId?: string

    persons: ShoutoutPerson[]
    /**
     * The label of the shoutout card in case there are multiple persons
     */
    multiplePersonsLabel: React.ReactNode | ((count: number) => React.ReactNode)
    metricName: React.ReactNode
    value: React.ReactNode
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
    className,
    testId,
    persons,
    multiplePersonsLabel,
    metricName,
    value,
    maxTooltipPersons = SHOUTOUT_MAX_PERSONS,
}: Props) {
    const tooltipRef = useRef<HTMLElement>(null)

    const moreThanOnePerson = persons.length > 1
    const firstPerson: ShoutoutPerson | undefined = persons[0]

    const getLabel = () => {
        if (persons.length === 0) return SHOUTOUT_NO_VALUE_PLACEHOLDER
        if (moreThanOnePerson)
            return multiplePersonsLabel instanceof Function
                ? multiplePersonsLabel(persons.length)
                : multiplePersonsLabel

        return firstPerson?.name
    }

    const tooltipPersons = useMemo(
        () => persons.slice(0, maxTooltipPersons),
        [maxTooltipPersons, persons]
    )
    const personsLengthExceeded = persons.length > maxTooltipPersons

    return (
        <div className={classNames(css.card, className)} data-testid={testId}>
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
            <div className={css.content}>
                <div className={css.label}>
                    {getLabel()}{' '}
                    {moreThanOnePerson && (
                        <>
                            <i
                                ref={tooltipRef}
                                className={classNames(
                                    'material-icons',
                                    css.infoIcon
                                )}
                                data-testid="shoutout-tooltip-trigger"
                            >
                                info_outline
                            </i>
                            <Tooltip
                                boundariesElement={'window'}
                                target={tooltipRef}
                                autohide={false}
                                placement={'top-start'}
                                delay={{show: 0, hide: 500}}
                            >
                                {tooltipPersons.map((person, idx, source) => (
                                    <React.Fragment key={idx}>
                                        {person.name}
                                        {idx !== source.length - 1 && (
                                            <>
                                                ; <br />
                                            </>
                                        )}
                                    </React.Fragment>
                                ))}
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
                        {isNil(value) ? SHOUTOUT_NO_VALUE_PLACEHOLDER : value}
                    </div>
                </div>
            </div>
        </div>
    )
}
