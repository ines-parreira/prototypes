import React from 'react'

import _isUndefined from 'lodash/isUndefined'
import _isNull from 'lodash/isNull'
import _isString from 'lodash/isString'
import _isBoolean from 'lodash/isBoolean'
import _isInteger from 'lodash/isInteger'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import moment from 'moment'

import {isImmutable} from 'common/utils'
import {SENTIMENT_TYPE_LOWER_BOUND, SENTIMENT_TYPE_UPPER_BOUND} from 'config'
import {isUrl, isEmail} from 'utils'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import StarRating from 'pages/common/components/StarRating'
import EditableListWidget from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/EditableListWidget'

import css from './fieldDataMappers.less'

export function getValueFromData(
    potentiallyImmutableData: unknown,
    type?: string,
    integrationType?: string
) {
    let assignedType = type
    const fallbackValue = '-'
    const data = (
        isImmutable(potentiallyImmutableData)
            ? potentiallyImmutableData.toJS()
            : potentiallyImmutableData
    ) as unknown

    if (_isUndefined(data) || _isNull(data)) {
        return fallbackValue
    }

    if (!type) {
        if (_isBoolean(data)) {
            assignedType = 'boolean'
        } else if (_isString(data) || typeof data === 'number') {
            assignedType = 'text'
        } else if (_isArray(data)) {
            assignedType = 'array'
        } else {
            return fallbackValue
        }
    }

    switch (assignedType) {
        case 'text': {
            if ((_isString(data) && data) || typeof data === 'number') {
                return data
            }
            break
        }
        case 'date': {
            if (_isString(data) && data) {
                return (
                    <DatetimeLabel
                        dateTime={data}
                        integrationType={integrationType}
                    />
                )
            }
            break
        }
        case 'age': {
            if (_isString(data) && moment(data).isValid()) {
                return `${moment().diff(data, 'years')} (${moment(data).format(
                    'YYYY-MM-DD'
                )})`
            }
            break
        }
        case 'url': {
            if (_isString(data) && isUrl(data)) {
                return (
                    <a href={data} target="_blank" rel="noopener noreferrer">
                        {data.length > 60 ? `${data.slice(0, 57)}...` : data}
                    </a>
                )
            }
            break
        }
        case 'email': {
            if (_isString(data) && isEmail(data)) {
                return (
                    <a
                        href={`mailto:${data}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {data}
                    </a>
                )
            }
            break
        }
        case 'boolean': {
            let isTrue = true

            if (_isBoolean(data)) {
                isTrue = data
            }

            if (_isString(data)) {
                isTrue = data === 'true' || data.toString() === '1'
            }

            if (_isInteger(data)) {
                isTrue = data !== 0
            }

            return (
                <Badge type={isTrue ? ColorType.Success : ColorType.Error}>
                    {isTrue ? 'True' : 'False'}
                </Badge>
            )
        }
        case 'array': {
            if (_isArray(data)) {
                if (!data.length) {
                    return fallbackValue
                }
                // This case means the array was empty when the template was generated
                // so we could not guess the type of data it would contains
                if (_isObject(data[0])) {
                    return 'Undetermined value'
                }
                return data.map(
                    (val: Maybe<string | number | boolean>, index: number) => {
                        return (
                            <React.Fragment key={index}>
                                {index > 0 && ', '}
                                {val ? val.toString() : fallbackValue}
                            </React.Fragment>
                        )
                    }
                )
            }

            break
        }
        case 'sentiment': {
            const value = Number(data)
            if (!Number.isNaN(value)) {
                return (
                    <>
                        {value >= SENTIMENT_TYPE_UPPER_BOUND ? (
                            <>
                                <strong>Positive</strong>
                                <span
                                    className={`material-icons ${css.greenThumb}`}
                                >
                                    thumb_up
                                </span>
                            </>
                        ) : value <= SENTIMENT_TYPE_LOWER_BOUND ? (
                            <>
                                <strong>Negative</strong>
                                <span
                                    className={`material-icons ${css.redThumb}`}
                                >
                                    thumb_down
                                </span>
                            </>
                        ) : (
                            <>
                                <strong>Inconclusive</strong>
                            </>
                        )}
                    </>
                )
            }
            break
        }
        case 'editableList': {
            if (_isString(data)) {
                return <EditableListWidget selectedOptions={data} />
            }
            break
        }
        case 'rating': {
            const value = Number(data)
            if (!Number.isNaN(value)) {
                return (
                    <>
                        <b>{value}</b>
                        <span className={css.starRatingWrapper}>
                            <StarRating value={value} />
                        </span>
                    </>
                )
            }
            break
        }
        case 'points': {
            const value = Number(data)
            if (!Number.isNaN(value)) {
                return (
                    <Badge type={ColorType.Grey}>
                        {value.toLocaleString()}
                    </Badge>
                )
            }

            break
        }
        case 'percent': {
            const value = Number(data)
            if (!Number.isNaN(value)) {
                return value.toString() + '%'
            }

            break
        }
    }

    return _isString(data) && data ? data : fallbackValue
}

export function getStringFromData(data: any, type: string): string | null {
    if (_isUndefined(data) || _isNull(data)) {
        return null
    }

    switch (type) {
        case 'text': {
            return (data as string).toString()
        }
        case 'date': {
            if (moment(data).isValid()) {
                return moment(data).format()
            }
            break
        }
        case 'url': {
            if (_isString(data) && isUrl(data)) {
                return data
            }
            break
        }
        case 'email': {
            if (_isString(data) && isEmail(data)) {
                return data
            }
            break
        }
        case 'age': {
            if (moment(data).isValid()) {
                return `${moment().diff(data, 'years')} (${moment(data).format(
                    'YYYY-MM-DD'
                )})`
            }
            break
        }
        case 'boolean': {
            let isTrue = true

            if (_isBoolean(data)) {
                isTrue = data
            }

            if (_isString(data)) {
                isTrue = data === 'true' || data.toString() === '1'
            }

            if (_isInteger(data)) {
                isTrue = data !== 0
            }

            return isTrue ? 'true' : 'false'
        }
        case 'rating': {
            const value = Number(data)
            if (!Number.isNaN(value)) {
                return value.toString()
            }
            break
        }
        case 'sentiment': {
            const value = Number(data)

            if (!Number.isNaN(value)) {
                if (value >= SENTIMENT_TYPE_UPPER_BOUND) {
                    return 'Positive'
                } else if (value <= SENTIMENT_TYPE_UPPER_BOUND) {
                    return 'Negative'
                }

                return 'Inconclusive'
            }
            break
        }
        case 'points': {
            const value = Number(data)
            if (!Number.isNaN(value)) {
                return value.toLocaleString()
            }

            break
        }
        case 'percent': {
            const value = Number(data)
            if (!Number.isNaN(value)) {
                return value.toString() + '%'
            }
            break
        }
    }
    return null
}
