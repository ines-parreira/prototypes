import {has, upperFirst} from 'lodash'
import moment from 'moment-timezone'

export function formatDatetime(datetime, timezone, format = 'calendar') {
    try {
        const raw = moment(datetime).tz(timezone || 'UTC')
        if (format === 'calendar') {
            return raw.calendar()
        } else {
            return raw.format(format)
        }
    } catch (e) {
        console.error('Failed to format datetime', e, datetime, timezone)
        return datetime
    }
}

export function lastMessage(messages) {
    return messages.slice().sort((m1, m2) => moment(m2.created_datetime).diff(moment(m1.created_datetime)))[0]
}

// given a field path. Ex: ticket.requester.id and OpenID schemas => resolve the last property
export function findProperty(field, schemas) {
    const parts = field.split('.')

    let def = schemas.getIn(['definitions', upperFirst(parts.shift())])
    let prop

    while (parts.length !== 0) {
        prop = def.getIn(['properties', parts.shift()])

        if (!prop) {
            return null
        }

        prop = prop.toJS()

        // if we have a ref then we need to redo the whole definition thing
        if (typeof prop.$ref !== 'undefined') {
            def = schemas.getIn(['definitions', prop.$ref.replace('#/definitions/', '')])
        } else if (prop.type === 'array') {
            if (typeof prop.items.$ref !== 'undefined') {
                def = schemas.getIn(['definitions', prop.items.$ref.replace('#/definitions/', '')])
            }
        }
    }
    return prop
}

export function equalityOperator(field, schemas) {
    const prop = findProperty(field, schemas)
    switch (prop.type) {
        case 'integer':
            return 'eq'
        case 'string':
            if (prop.meta && prop.meta.operators) {
                if (has(prop.meta.operators, 'contains')) {
                    return 'contains'
                }
            }
            return 'eq'
        default:
            return 'eq'
    }
}

export function resolveLiteral(value, field) {
    switch (typeof value) {
        case 'object':
            return value[field.split('.').reverse()[0]]
        case 'string':
            return `'${value}'`
        default:
            return value
    }
}
