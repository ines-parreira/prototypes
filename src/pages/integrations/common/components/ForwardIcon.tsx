import React from 'react'
import {Link} from 'react-router-dom'

type Props = {
    href: string
    onClick?: React.ComponentProps<Link>['onClick']
}

const ForwardIcon: React.FC<Props> = ({href, onClick}) => {
    return (
        <Link to={href} onClick={onClick}>
            <i className="material-icons md-2 align-middle icon-go-forward">
                keyboard_arrow_right
            </i>
        </Link>
    )
}

export default ForwardIcon
