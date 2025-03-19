import { Link } from 'react-router-dom'

import ArrowBackwardIcon from 'assets/img/icons/arrow-backward.svg'

import css from './GorgiasTranslateText.less'

export type Props = {
    onClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
    url: string
}

const GorgiasTranslateTextBackLink = ({ onClick, url }: Props) => {
    return (
        <div className={css.backWrapper}>
            <Link onClick={onClick} to={url} className="d-flex">
                <img src={ArrowBackwardIcon} alt="Back" />
                Back
            </Link>
        </div>
    )
}

export default GorgiasTranslateTextBackLink
