import React from 'react'
import {useHistory} from 'react-router-dom'
import classNames from 'classnames'

import Button from 'pages/common/components/button/Button'

import css from './AIBanner.less'

type AIBannerProps = {
    helpCenterId: number
    className?: string
    /**
     * This is used to track the source of the click event.
     */
    from: string
}

const AIBanner = ({helpCenterId, className, from}: AIBannerProps) => {
    const history = useHistory()

    return (
        <div className={classNames(css.container, className)}>
            <div className={css.textContainer}>
                <i className="material-icons">auto_awesome</i>
                <div className={css.text}>
                    <div className={css.title}>
                        New AI generated articles available
                    </div>
                    <div className={css.description}>
                        We've generated new articles based on popular customer
                        inquiries over the past 90 days that could help deflect
                        customers.
                    </div>
                </div>
            </div>
            <a
                className={css.link}
                onClick={(ev) => {
                    ev.preventDefault()
                    history.push(
                        `/app/settings/help-center/${helpCenterId}/ai-library`,
                        {
                            from,
                        }
                    )
                }}
            >
                <Button intent="primary" fillStyle="ghost">
                    Review Articles
                </Button>
            </a>
        </div>
    )
}

export default AIBanner
