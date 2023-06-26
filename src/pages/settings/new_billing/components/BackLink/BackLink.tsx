import React from 'react'
import {useHistory} from 'react-router-dom'

import css from './BackLink.less'

const BackLink = () => {
    const history = useHistory()

    const goBack = () => {
        history.goBack()
    }

    return (
        <div className={css.backLink} onClick={goBack}>
            <i className="material-icons">arrow_back</i>Back
        </div>
    )
}

export default BackLink
