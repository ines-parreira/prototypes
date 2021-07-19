// @flow
import React from 'react'
import pluralize from 'pluralize'
import classnames from 'classnames'

import {DatetimeLabel} from '../../../common/utils/labels.tsx'

import css from './SatisfactionSurvey.less'
import fullStar from './../../../../../img/satisfaction-survey/full-star.svg'

type PropTypes = {
    satisfactionSurvey: Object,
    customer: Object,
    isLast: boolean,
}

export default class SatisfactionSurvey extends React.Component<PropTypes> {
    _renderDatetime() {
        const {satisfactionSurvey} = this.props
        const scoredDatetime = satisfactionSurvey.get('scored_datetime')
        const sentDatetime = satisfactionSurvey.get('sent_datetime')
        const shouldSendDatetime = satisfactionSurvey.get(
            'should_send_datetime'
        )

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
        const score = satisfactionSurvey.get('score')

        return (
            <div
                className={classnames(css.component, {
                    [css.last]: isLast,
                })}
                id="satisfactionSurvey"
            >
                <div className={css.star}>
                    <img alt="survey rating" src={fullStar} />
                </div>

                <div className={css.body}>
                    <div className={css.header}>
                        <div className={css.headerDetails}>
                            <span className={css.score}>
                                {satisfactionSurvey.get('scored_datetime')
                                    ? `${score} ${pluralize('star', score)}`
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

                    {satisfactionSurvey.get('body_text') && (
                        <div className={css.body_text}>
                            {satisfactionSurvey.get('body_text')}
                        </div>
                    )}
                </div>
            </div>
        )
    }
}
