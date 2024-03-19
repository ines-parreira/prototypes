import React from 'react'
import {Link} from 'react-router-dom'

import ArrowBackwardIcon from 'assets/img/icons/arrow-backward.svg'

import css from './CampaignDetailsHeader.less'

type Props = {
    title: string
    backToHref: string
}

export const CampaignDetailsHeader = ({
    backToHref,
    title,
}: Props): JSX.Element => {
    return (
        <div className={css.backWrapper}>
            <Link to={backToHref} className="d-flex">
                <img src={ArrowBackwardIcon} alt={title} />
                {title}
            </Link>
        </div>
    )
}
