import React from 'react'
import {useHistory} from 'react-router-dom'

import {CONTACT_FORM_PUBLISH_PATH} from '../../constants'
import {insertContactFormIdParam} from '../../utils/navigation'
import css from './BackLink.less'

type BackLinkProps = {
    contactFormId: number
}

const BackLink = ({contactFormId}: BackLinkProps) => {
    const history = useHistory()

    const goBack = () => {
        history.push(
            insertContactFormIdParam(CONTACT_FORM_PUBLISH_PATH, contactFormId)
        )
    }

    return (
        <div className={css.backLink} onClick={goBack}>
            <i className="material-icons">arrow_back</i>Back to publishing
            methods
        </div>
    )
}

export default BackLink
