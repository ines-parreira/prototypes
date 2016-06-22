import {has, upperFirst, isString} from 'lodash'
import esprima from 'esprima'
import escodegen from 'escodegen'
import moment from 'moment-timezone'

export function formatDatetime(datetime, timezone, format = 'calendar') {
    try {
        const raw = timezone ? moment(datetime).tz(timezone || 'UTC') : moment(datetime)

        if (format === 'calendar') {
            return raw.calendar()
        }
        return raw.format(format)
    } catch (e) {
        console.error('Failed to format datetime', e, datetime, timezone)
        return datetime
    }
}

export function getAST(code) {
    if (!isString(code)) {
        console.error('Not a string:', code)
    }
    return esprima.parse(code)
}

export function getCode(ast) {
    if (!isString(ast.type)) {
        console.error('Not an AST:', ast)
    }
    return escodegen.generate(ast, {
        format: {
            semicolons: false
        }
    })
}


export function lastMessage(messages) {
    return messages.slice().sort((m1, m2) => moment(m2.created_datetime).diff(moment(m1.created_datetime)))[0]
}

export function firstMessage(messages) {
    return messages.slice().sort((m1, m2) => moment(m1.created_datetime).diff(moment(m2.created_datetime)))[0]
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

/**
 * Return '⌘' if the user is using a Mac, 'Ctrl' otherwise
 * @returns {string}
 */
export function getModifier() {
    const isMac = navigator.platform.toLowerCase().startsWith('mac')
    return isMac ? '⌘' : 'Ctrl'
}

// stolen from: https://github.com/HubSpot/humanize/blob/master/src/humanize.js#L84
export function compactInteger(input, decimals = 0) {
    decimals = Math.max(decimals, 0);
    const number = parseInt(input, 10);
    const signString = number < 0 ? '-' : '';
    const unsignedNumber = Math.abs(number);
    const unsignedNumberString = String(unsignedNumber);
    const numberLength = unsignedNumberString.length;
    const numberLengths = [13, 10, 7, 4];
    const bigNumPrefixes = ['T', 'B', 'M', 'k'];

    // small numbers
    if (unsignedNumber < 1000) {
        return `${signString}${unsignedNumberString}`;
    }

    // really big numbers
    if (numberLength > numberLengths[0] + 3) {
        return number.toExponential(decimals).replace('e+', 'x10^');
    }

    // 999 < unsignedNumber < 999,999,999,999,999
    let length;
    for (let i = 0; i < numberLengths.length; i++) {
        const _length = numberLengths[i];
        if (numberLength >= _length) {
            length = _length;
            break;
        }
    }

    const decimalIndex = numberLength - length + 1;
    const unsignedNumberCharacterArray = unsignedNumberString.split('');

    const wholePartArray = unsignedNumberCharacterArray.slice(0, decimalIndex);
    const decimalPartArray = unsignedNumberCharacterArray.slice(decimalIndex, decimalIndex + decimals + 1);

    const wholePart = wholePartArray.join('');

    // pad decimalPart if necessary
    let decimalPart = decimalPartArray.join('');
    if (decimalPart.length < decimals) {
        decimalPart += `${Array(decimals - decimalPart.length + 1).join('0')}`;
    }

    let output;
    if (decimals === 0) {
        output = `${signString}${wholePart}${bigNumPrefixes[numberLengths.indexOf(length)]}`;
    } else {
        const outputNumber = Number(`${wholePart}.${decimalPart}`).toFixed(decimals);
        output = `${signString}${outputNumber}${bigNumPrefixes[numberLengths.indexOf(length)]}`;
    }

    return output;
}
