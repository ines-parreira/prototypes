import React, { ComponentProps, useMemo } from 'react'

import { DropdownMenu } from 'reactstrap'

import {
    eventNameToLabel,
    events,
    eventsDependencies,
} from '../../../../config/rules'
import {
    getArraysIntersection,
    eventTypes as getEventTypes,
} from '../../../../state/rules/helpers'
import { RuleDraft } from '../../../../state/rules/types'
import Errors from '../../../common/components/ast/Errors'
import SelectField from '../../../common/forms/MultiSelectField'

import css from './RulesTriggerSelect.less'

const RuleTriggerDropdownMenu = (
    props: ComponentProps<typeof DropdownMenu>,
) => <DropdownMenu {...props} style={{ width: '220px' }} />

export type Props = {
    rule: RuleDraft
    setEventTypes: (events: string) => void
}

export function RulesTriggerSelect({ rule, setEventTypes }: Props) {
    const eventTypes = useMemo(() => getEventTypes(rule), [rule])

    const dependentEvents = useMemo(
        () =>
            getArraysIntersection(
                eventsDependencies['ticket-updated'],
                eventTypes,
            ).map((event) => eventNameToLabel[event]),
        [eventTypes],
    )

    const containsDependentEvents = useMemo(
        () =>
            eventTypes.includes('ticket-updated') && dependentEvents.length > 0,
        [eventTypes, dependentEvents],
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
                dropdownMenu={
                    // TODO(React18): Type mismatch on RuleTriggerDropdownMenu props. Safe cast for now.
                    RuleTriggerDropdownMenu as unknown as React.ComponentType<unknown>
                }
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
