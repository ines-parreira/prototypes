import React, {PropTypes} from 'react'
import classNames from 'classnames'
import {sanitizeHtmlDefault} from '../../../../utils'
import {DatetimeLabel} from '../../../common/utils/labels'

export default class CustomerRating extends React.Component {


    render() {
        const {rating} = this.props

        if (!rating.get('rating_datetime')) {
            // The user did not answer the survey
            return null
        }

        const RATING_SCORE_TO_MESSAGE = {0: 'BAD', 5: 'OKAY', 10: 'GREAT'}
        const RATING_SCORE_TO_ICON_CLASS = {0: 'thumbs down icon', 5: 'meh icon', 10: 'thumbs up icon'}

        const className = classNames(
            'ticket-message',
            'ui',
            'raw',
            'segment',
            'customer-rating',
            RATING_SCORE_TO_MESSAGE[rating.get('rating')].toLowerCase()
        )

        return (
            <div className={className} ref="ticketMessage">

                <div
                    className={classNames('ticket-message-header', 'customer-rating', RATING_SCORE_TO_MESSAGE[rating.get('rating')].toLowerCase())}
                >
                    <div className="ticket-customer-rating-score">
                        <i className={RATING_SCORE_TO_ICON_CLASS[rating.get('rating')]}></i>
                        {`${RATING_SCORE_TO_MESSAGE[rating.get('rating')]} RATING`}
                    </div>
                    <div className="ticket-message-time">
                        <DatetimeLabel dateTime={rating.get('rating_datetime')} />
                    </div>
                </div>
                <div
                    className={classNames('customer-rating', RATING_SCORE_TO_MESSAGE[rating.get('rating')].toLowerCase())}
                >
                    {(() => {
                        let comment = rating.get('comment')
                        if (comment !== undefined) {
                            comment = sanitizeHtmlDefault(comment)
                        }
                        return (!comment || comment.length === 0) ? 'The user did not leave any comment.' : comment
                    })()
                    }
                </div>

            </div>
        )
    }
}

CustomerRating.propTypes = {
    rating: PropTypes.object.isRequired
}
