import {screen, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import moment from 'moment'
import React, {ReactElement, ReactNode} from 'react'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import {assumeMock, getLastMockCall} from 'utils/testing'

import {FALLBACK_VALUE} from 'Widgets/modules/Template/modules/Field'

import {getStringFromData, getValueFromData} from '../fieldDataMappers'

jest.mock('pages/common/utils/DatetimeLabel', () => {
    return jest.fn(() => null)
})
jest.mock('pages/common/components/Badge/Badge', () => {
    return {
        __esModule: true,
        ...jest.requireActual('pages/common/components/Badge/Badge'),
        default: jest.fn(({children}: {children: ReactNode}) => children),
    } as Record<string, unknown>
})
jest.mock('pages/common/components/StarRating', () => {
    return jest.fn(() => null)
})
const DatetimeLabelMock = assumeMock(DatetimeLabel)
const BadgeMock = assumeMock(Badge)

describe('getValueFromData()', () => {
    it('should return passed data because passed type is `text`', () => {
        const passedData = 'foo'
        expect(getValueFromData(passedData, 'text')).toBe(passedData)
    })

    it('should return a datetime label because passed type is `date`', () => {
        const passedData = '2017-12-14T16:34'
        render(<>{getValueFromData(passedData, 'date')}</>)
        expect(getLastMockCall(DatetimeLabelMock)[0]).toEqual({
            dateTime: passedData,
            integrationType: undefined,
        })
    })

    it('should return an age string because passed type is `age` and passed data is a valid datetime', () => {
        const expectedAge = 2
        const currentYear = new Date().getFullYear()

        const year = `${currentYear - expectedAge}-01-01`
        expect(getValueFromData(`${year} 00:05:00`, 'age')).toBe(
            `${expectedAge} (${year})`
        )
    })

    it('should return passed data because passed type is `age` and passed data is not a valid datetime', () => {
        const passedData = '20180101-05 00:'
        expect(getValueFromData(passedData, 'age')).toBe(passedData)
    })

    it('should return a link because passed type is `url` and passed data is an url', () => {
        render(<>{getValueFromData('https://gorgias.io', 'url')}</>)
        expect(document.querySelector('a')).toHaveAttribute(
            'href',
            'https://gorgias.io'
        )
    })

    it('should return passed data because passed type is `url` and passed data is not an url', () => {
        const passedData = 'httpsgorgiasio'
        expect(getValueFromData(passedData, 'url')).toBe(passedData)
    })

    it('should return a link because passed type is `email` and passed data is an email address', () => {
        render(<>{getValueFromData('developers@gorgias.io', 'email')}</>)
        expect(document.querySelector('a')).toHaveAttribute(
            'href',
            'mailto:developers@gorgias.io'
        )
    })

    it('should return passed data because passed type is `email` and passed data is not an email address', () => {
        const passedData = 'developersgorgias.io'
        expect(getValueFromData(passedData, 'email')).toBe(passedData)
    })

    const validValues: [string | number, string, string][] = [
        ['1', 'sentiment', 'Positive'],
        [1, 'sentiment', 'Positive'],
        ['-1', 'sentiment', 'Negative'],
        [-1, 'sentiment', 'Negative'],
        ['0', 'sentiment', 'Inconclusive'],
        [0, 'sentiment', 'Inconclusive'],
        ['1', 'rating', '1'],
        [1, 'rating', '1'],
        [5, 'rating', '5'],
        ['1', 'points', '1'],
        [1, 'points', '1'],
        [555, 'points', '555'],
        ['1', 'percent', '1%'],
        [1, 'percent', '1%'],
        [555, 'percent', '555%'],
    ]
    const defaultValues = [
        ['hello', 'sentiment', 'hello'],
        ['hello', 'rating', 'hello'],
        ['hello', 'points', 'hello'],
        ['hello', 'percent', 'hello'],
    ]

    it.each(validValues)(
        'given %p and %p as arguments, returns correct value',
        (data, type, expected) => {
            render(<>{getValueFromData(data, type)}</>)
            expect(screen.getByText(new RegExp(expected))).toBeInTheDocument()
        }
    )
    it.each(defaultValues)(
        'given %p and %p as arguments, returns default value',
        (data, type, expected) => {
            render(<>{getValueFromData(data, type)}</>)
            expect(screen.getByText(new RegExp(expected))).toBeInTheDocument()
        }
    )
    it('should return the default value when passed an empty value', () => {
        expect(getValueFromData(undefined)).toEqual(FALLBACK_VALUE)
        expect(getValueFromData(null)).toEqual(FALLBACK_VALUE)
        expect(getValueFromData('')).toEqual(FALLBACK_VALUE)
    })

    it.each([[true], ['true'], ['1'], [1], [42]])(
        'should return a success badge because passed data is a `true` value',
        (data) => {
            render(<>{getValueFromData(data, 'boolean')}</>)
            expect(getLastMockCall(BadgeMock)[0]).toEqual({
                type: ColorType.Success,
                children: 'True',
            })
        }
    )

    it.each([[false], ['false'], ['0'], [0]])(
        'should return a danger badge because passed data is a `false` value',
        (data) => {
            render(<>{getValueFromData(data, 'boolean')}</>)
            expect(getLastMockCall(BadgeMock)[0]).toEqual({
                type: ColorType.Error,
                children: 'False',
            })
        }
    )

    it('should return default value when passer undefined, null or an object', () => {
        expect(getValueFromData({key: 'value'})).toBe(FALLBACK_VALUE)
        expect(getValueFromData(undefined)).toBe(FALLBACK_VALUE)
        expect(getValueFromData(null)).toBe(FALLBACK_VALUE)
    })

    it('should work when passed an immutable object', () => {
        expect(getValueFromData(fromJS({key: 'value'}))).toBe(FALLBACK_VALUE)
    })

    describe('array', () => {
        it('should return a comma-separated list of rendered values because passed data is an array', () => {
            render(getValueFromData([123, 'test', true, null]) as ReactElement)
            expect(
                screen.getByText(/123.*,.*test.*,.*true.*,.*-/)
            ).toBeInTheDocument()
        })

        it('should return "Undetermined value" when passed an array of objects', () => {
            expect(getValueFromData([{foo: 'bar'}])).toBe('Undetermined value')
        })

        it('should return the default value when passed an empty array ', () => {
            expect(getValueFromData([])).toBe(FALLBACK_VALUE)
        })
    })
})

describe('getStringFromData()', () => {
    it('should return null because passed data is undefined', () => {
        expect(getStringFromData(undefined, '')).toEqual(null)
    })

    it('should return null because passed data is null', () => {
        expect(getStringFromData(null, '')).toEqual(null)
    })

    it('should return passed data because passed type is `text`', () => {
        expect(getStringFromData('foo', 'text')).toEqual('foo')
    })

    it('should return passed data as string because passed type is `text`', () => {
        expect(getStringFromData(1, 'text')).toEqual('1')
    })

    it('should return null when invalid datetime and passed type is `date`', () => {
        expect(getStringFromData('foo', 'date')).toBeNull()
    })

    it('should return a formatted datetime label because passed type is `date`', () => {
        expect(getStringFromData('2017-12-14T16:34', 'date')).toBe(
            '2017-12-14T16:34:00Z'
        )
    })

    it('should return a formatted datetime label because passed type is `date`', () => {
        expect(getStringFromData(1513269240000, 'date')).toBe(
            '2017-12-14T16:34:00Z'
        )
    })

    it('should return an age string because passed type is `age` and passed data is a valid datetime', () => {
        const expectedAge = 2
        const currentYear = new Date().getFullYear()

        const year = `${currentYear - expectedAge}-01-01`
        expect(getStringFromData(`${year} 00:05:00`, 'age')).toEqual(
            `${expectedAge} (${year})`
        )
    })

    it('should return an age string label because passed type is `age`', () => {
        const timestamp = 1513269240000
        const age = moment().diff(moment(timestamp), 'years')

        expect(getStringFromData(1513269240000, 'age')).toBe(
            `${age} (2017-12-14)`
        )
    })

    it('should return passed data because passed type is `age` and passed data is not a valid datetime', () => {
        expect(getStringFromData('foo', 'age')).toBeNull()
    })

    it('should return the url because passed type is `url` and passed data is an url', () => {
        expect(getStringFromData('https://gorgias.io', 'url')).toBe(
            'https://gorgias.io'
        )
    })

    it('should return null because passed type is `url` and passed data is not an url', () => {
        expect(getStringFromData('foo', 'url')).toBeNull()
        expect(getStringFromData(1, 'url')).toBeNull()
        expect(getStringFromData('google.com', 'url')).toBeNull()
    })

    it('should return the emai because passed type is `email` and passed data is an email address', () => {
        expect(getStringFromData('developers@gorgias.io', 'email')).toBe(
            'developers@gorgias.io'
        )
    })

    it('should return null because passed type is `email` and passed data is not an email', () => {
        expect(getStringFromData('foo', 'email')).toBeNull()
        expect(getStringFromData(1, 'email')).toBeNull()
        expect(getStringFromData('google.com', 'email')).toBeNull()
    })

    it('should return `true` because passed type is `boolean` and passed data is a `true` value', () => {
        expect(getStringFromData('true', 'boolean')).toBe('true')
        expect(getStringFromData('1', 'boolean')).toBe('true')
        expect(getStringFromData(1, 'boolean')).toBe('true')
        expect(getStringFromData(42, 'boolean')).toBe('true')
    })

    it('should return `false` because passed type is `boolean` and passed data is a `false` value', () => {
        expect(getStringFromData('false', 'boolean')).toBe('false')
        expect(getStringFromData('0', 'boolean')).toBe('false')
        expect(getStringFromData(0, 'boolean')).toBe('false')
    })

    const validValues: [string | number, string, string | null][] = [
        ['1', 'sentiment', 'Positive'],
        [1, 'sentiment', 'Positive'],
        ['-1', 'sentiment', 'Negative'],
        [-1, 'sentiment', 'Negative'],
        ['0', 'sentiment', 'Negative'],
        [0, 'sentiment', 'Negative'],
        ['1', 'rating', '1'],
        [1, 'rating', '1'],
        [5, 'rating', '5'],
        ['1', 'points', '1'],
        [1, 'points', '1'],
        [555, 'points', '555'],
        ['1', 'percent', '1%'],
        [1, 'percent', '1%'],
        [555, 'percent', '555%'],
    ]

    it.each(validValues)(
        'given %p and %p as arguments, returns correct value',
        (data, type, expected) => {
            expect(getStringFromData(data, type)).toBe(expected)
        }
    )

    const defaultValues = [
        ['hello', 'sentiment'],
        ['hello', 'rating'],
        ['hello', 'points'],
        ['hello', 'percent'],
    ]

    it.each(defaultValues)(
        'given %p and %p as arguments, returns default value',
        (data, type) => {
            expect(getStringFromData(data, type)).toBeNull()
        }
    )
})
