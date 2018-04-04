// @flow
import React from 'react'
import {Link} from 'react-router'

const ForwardIcon = (props: {href: string}) => {

    return (
        <Link to={props.href}>
            <i className="material-icons md-2 align-middle icon-go-forward">
                keyboard_arrow_right
            </i>
        </Link>
    )
}

export default ForwardIcon
