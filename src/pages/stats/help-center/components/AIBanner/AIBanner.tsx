import React from 'react'
import {Link} from 'react-router-dom'

import Button from 'pages/common/components/button/Button'

import css from './AIBanner.less'

type AIBannerProps = {
    helpCenterId: number
}

const AIBanner = ({helpCenterId}: AIBannerProps) => {
    return (
        <div className={css.container}>
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
            <Link
                to={`/app/settings/help-center/${helpCenterId}/ai-library`}
                className={css.link}
            >
                <Button intent="primary" fillStyle="ghost">
                    Review Articles
                </Button>
            </Link>
        </div>
    )
}

export default AIBanner
