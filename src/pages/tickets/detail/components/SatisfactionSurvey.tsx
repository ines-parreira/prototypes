import React, {Component} from 'react'
import pluralize from 'pluralize'
import classnames from 'classnames'
import {Map} from 'immutable'

import fullStar from 'assets/img/satisfaction-survey/full-star.svg'

import {DatetimeLabel} from 'pages/common/utils/labels'
import {getLDClient} from 'utils/launchDarkly'
import {FeatureFlagKey} from 'config/featureFlags'

import css from './SatisfactionSurvey.less'

type Props = {
    satisfactionSurvey: Map<any, any>
    customer: Map<any, any>
    isLast: boolean
}

export default class SatisfactionSurvey extends Component<Props> {
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
        // TODO: refactor after Virtualization is rolled out
        const isVirtualizationEnabled =
            getLDClient().allFlags()[
                FeatureFlagKey.TicketMessagesVirtualization
            ]

        const {satisfactionSurvey, isLast, customer} = this.props
        const score = satisfactionSurvey.get('score') as number

        return (
            <div
                className={classnames(css.component, {
                    [css.isVirtualized]: isVirtualizationEnabled,
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
