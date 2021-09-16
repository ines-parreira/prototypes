import React, {useMemo} from 'react'

import {
    eventTypes as getEventTypes,
    getArraysIntersection,
} from '../../../../state/rules/helpers'
import {
    eventNameToLabel,
    events,
    eventsDependencies,
} from '../../../../config/rules'
import SelectField from '../../../common/forms/MultiSelectField'
import Errors from '../../../common/components/ast/Errors'
import {RuleDraft} from '../../../../state/rules/types'

import css from './RulesTriggerSelect.less'

export type Props = {
    rule: RuleDraft
    setEventTypes: (events: string) => void
}

export function RulesTriggerSelect({rule, setEventTypes}: Props) {
    const eventTypes = useMemo(() => getEventTypes(rule), [rule])

    const dependentEvents = useMemo(
        () =>
            getArraysIntersection(
                eventsDependencies['ticket-updated'],
                eventTypes
            ).map((event) => eventNameToLabel[event]),
        [eventTypes]
    )

    const containsDependentEvents = useMemo(
        () =>
            eventTypes.includes('ticket-updated') && dependentEvents.length > 0,
        [eventTypes, dependentEvents]
    )

    const handleEventTypes = (events: string[]) => {
        setEventTypes(events.join(','))
    }

    return (
        <div className={css.container}>
            <div className={css.whenBtn}>WHEN</div>
            <SelectField
                values={eventTypes}
                options={events.toJS()}
                singular="event"
                plural="events"
                onChange={handleEventTypes}
                className={css.whenEvents}
            />
            {eventTypes.length === 0 && (
                <Errors inline>You need to select at least one trigger</Errors>
            )}
            {containsDependentEvents && (
                <Errors inline>
                    <b>{dependentEvents.join(', ')}</b> already covered by{' '}
                    <b>ticket updated</b>
                </Errors>
            )}
        </div>
    )
}
