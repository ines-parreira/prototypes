import React from 'react'
import {Link} from 'react-router-dom'

import ArrowBackwardIcon from 'assets/img/icons/arrow-backward.svg'

import css from './CampaignDetailsHeader.less'

type Props = {
    isUpdate?: boolean
    backToHref: string
}

export const CampaignDetailsHeader = ({backToHref}: Props): JSX.Element => {
    return (
        <div className={css.backWrapper}>
            <Link to={backToHref} className="d-flex">
                <img src={ArrowBackwardIcon} alt="Back to Campaigns list" />
                Back to Campaigns list
            </Link>
        </div>
    )
}
