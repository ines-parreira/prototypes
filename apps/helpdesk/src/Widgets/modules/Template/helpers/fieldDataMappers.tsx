import { Fragment } from 'react'

import _isArray from 'lodash/isArray'
import _isBoolean from 'lodash/isBoolean'
import _isInteger from 'lodash/isInteger'
import _isNull from 'lodash/isNull'
import _isObject from 'lodash/isObject'
import _isString from 'lodash/isString'
import _isUndefined from 'lodash/isUndefined'
import moment from 'moment'

import { Badge } from '@gorgias/axiom'

import { isImmutable } from 'common/utils'
import { SENTIMENT_TYPE_LOWER_BOUND, SENTIMENT_TYPE_UPPER_BOUND } from 'config'
import StarRating from 'pages/common/components/StarRating'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import { isEmail, isUrl } from 'utils'
import { FALLBACK_VALUE } from 'Widgets/modules/Template/modules/Field'

import css from './fieldDataMappers.less'

export function getValueFromData(
    potentiallyImmutableData: unknown,
    type?: string,
) {
    let assignedType = type
    const data = (
        isImmutable(potentiallyImmutableData)
            ? potentiallyImmutableData.toJS()
            : potentiallyImmutableData
    ) as unknown

    if (_isUndefined(data) || _isNull(data)) {
        return FALLBACK_VALUE
    }

    if (!type) {
        if (_isBoolean(data)) {
            assignedType = 'boolean'
        } else if (_isString(data) || typeof data === 'number') {
            assignedType = 'text'
        } else if (_isArray(data)) {
            assignedType = 'array'
        } else {
            return FALLBACK_VALUE
        }
    }

    // We should map over default leaf types with a config object instead of a switch
    switch (assignedType) {
        case 'text': {
            if ((_isString(data) && data) || typeof data === 'number') {
                return data
            }
            break
        }
        case 'date': {
            if (_isString(data) && data) {
                return <DatetimeLabel dateTime={data} />
            }
            break
        }
        case 'age': {
            if (_isString(data) && moment(data).isValid()) {
                return `${moment().diff(data, 'years')} (${moment(data).format(
                    'YYYY-MM-DD',
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
                <Badge type={isTrue ? 'success' : 'error'}>
                    {isTrue ? 'True' : 'False'}
                </Badge>
            )
        }
        case 'array': {
            if (_isArray(data)) {
                if (!data.length) {
                    return FALLBACK_VALUE
                }
                // This case means the array was empty when the template was generated
                // so we could not guess the type of data it would contains
                if (_isObject(data[0])) {
                    return 'Undetermined value'
                }
                return data.map(
                    (val: Maybe<string | number | boolean>, index: number) => {
                        return (
                            <Fragment key={index}>
                                {index > 0 && ', '}
                                {val ? val.toString() : FALLBACK_VALUE}
                            </Fragment>
                        )
                    },
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
                return <Badge type="grey">{value.toLocaleString()}</Badge>
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

    return _isString(data) && data ? data : FALLBACK_VALUE
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
                    'YYYY-MM-DD',
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
