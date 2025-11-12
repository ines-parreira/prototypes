import { logEvent, SegmentEvent } from '@repo/logging'
import classnames from 'classnames'

import academy from 'assets/img/academy.png'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import css from './CourseCard.less'

const CourseCard = () => {
    const currentAccount = useAppSelector(getCurrentAccountState)

    return (
        <div className={classnames(css.card, 'ml-3')}>
            <img src={academy} alt="Academy" width="97" />
            <div className="mb-2">
                Learn more about Rules
                <br />
                through Gorgias Academy
            </div>
            <a
                className={css.link}
                href="https://academy.gorgias.com/"
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
