import React from 'react'
import {useHistory} from 'react-router-dom'

import css from './BackLink.less'

type BackLinkProps = {
    path: string
    label: string
}

const BackLink = ({path, label}: BackLinkProps) => {
    const history = useHistory()

    const goBack = () => {
        history.push(path)
    }

    return (
        <div className={css.backLink} onClick={goBack}>
            <i className="material-icons">arrow_back</i>
            {label}
        </div>
    )
}

export default BackLink
