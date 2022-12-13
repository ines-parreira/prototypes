import React from 'react'
import classnames from 'classnames'

import academy from 'assets/img/academy.png'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

import useAppSelector from 'hooks/useAppSelector'

import css from './CourseCard.less'

const CourseCard = () => {
    const currentAccount = useAppSelector(getCurrentAccountState)

    return (
        <div className={classnames(css.card, 'ml-3')}>
            <img src={academy} alt="Academy" width="97" />
            <div className="mb-2">
                Take our Gorgias
                <br />
                Academy course on rules
            </div>
            <a
                className={css.link}
                href="https://academy.gorgias.com/training/2787d4b6-9ddf-11ec-8074-020df940d6b7/overview"
                rel="noopener noreferrer"
                target="_blank"
                onClick={() => {
                    logEvent(SegmentEvent.RuleAcademyVisited, {
                        domain: currentAccount?.get('domain'),
                    })
                }}
            >
                Start Learning{' '}
                <i className="material-icons">arrow_forward_ios</i>
            </a>
        </div>
    )
}

export default CourseCard
