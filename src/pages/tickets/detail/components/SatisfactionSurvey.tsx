import classnames from 'classnames'
import {Map} from 'immutable'
import pluralize from 'pluralize'
import React, {Component} from 'react'

import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import css from './SatisfactionSurvey.less'

type Props = {
    satisfactionSurvey: Map<any, any>
    customer: Map<any, any>
    isLast: boolean
}

export default class SatisfactionSurvey extends Component<Props> {
    _renderDatetime() {
        const {satisfactionSurvey} = this.props
        let scoredDatetime = satisfactionSurvey.get('scored_datetime')
        const sentDatetime = satisfactionSurvey.get('sent_datetime')
        const shouldSendDatetime = satisfactionSurvey.get(
            'should_send_datetime'
        )
        if (satisfactionSurvey.get('isEvent')) {
            scoredDatetime = satisfactionSurvey.get(
                'created_datetime'
            ) as string
        }

        if (scoredDatetime) {
            return <DatetimeLabel dateTime={scoredDatetime} />
        }

        if (sentDatetime) {
            return (
                <div>
                    <span className="mr-1">Was sent</span>
                    <DatetimeLabel dateTime={sentDatetime} />
                </div>
            )
        }

        return (
            <div>
                <span className="mr-1">To be sent</span>
                <DatetimeLabel dateTime={shouldSendDatetime} />
            </div>
        )
    }

    render() {
        const {satisfactionSurvey, isLast, customer} = this.props
        let score = satisfactionSurvey.get('score') as number
        let scoredDate = satisfactionSurvey.get('scored_datetime') as string
        let bodyText = satisfactionSurvey.get('body_text') as string
        if (satisfactionSurvey.get('isEvent')) {
            const data = satisfactionSurvey.get('data') as Map<string, unknown>
            score = data.get('score') as number
            scoredDate = satisfactionSurvey.get('created_datetime') as string
            bodyText = data.get('body_text') as string
        }

        return (
            <div
                className={classnames(css.component, {
                    [css.last]: isLast,
                })}
                id={`satisfactionSurvey-${satisfactionSurvey.get('id')}`}
            >
                <div
                    className={classnames(css.icon, {
                        [css.last]: isLast,
                    })}
                >
                    <i className="material-icons">star</i>
                </div>

                <div className={css.body}>
                    <div className={css.header}>
                        <div className={css.headerDetails}>
                            <span className={css.score}>
                                {scoredDate
                                    ? `${score} ${pluralize('star', score)} CSAT review`
                                    : 'No results'}
                            </span>
                            from
                            <span className={css.author}>
                                {customer.get('name') || customer.get('email')}
                            </span>
                        </div>
                        <span
                            className={classnames(
                                css.date,
                                'text-faded float-right'
                            )}
                        >
                            {this._renderDatetime()}
                        </span>
                    </div>

                    {bodyText && (
                        <div className={css.body_text_container}>
                            <i className="material-icons">star</i>
                            <span className={css.body_text}>{bodyText}</span>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}
