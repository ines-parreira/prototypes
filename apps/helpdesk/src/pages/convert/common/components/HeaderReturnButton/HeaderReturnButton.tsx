import classNames from 'classnames'
import { Link } from 'react-router-dom'

import ArrowBackwardIcon from 'assets/img/icons/arrow-backward.svg'

import css from './HeaderReturnButton.less'

type Props = {
    title: string
    backToHref: string
    className?: string
}

export const HeaderReturnButton: React.FC<Props> = ({
    backToHref,
    title,
    className,
}): JSX.Element => {
    return (
        <div className={classNames(css.backWrapper, className)}>
            <Link to={backToHref} className="d-flex">
                <img src={ArrowBackwardIcon} alt={title} />
                {title}
            </Link>
        </div>
    )
}
