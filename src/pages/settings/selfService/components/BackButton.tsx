import React from 'react'
import {useHistory} from 'react-router-dom'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import css from './BackButton.less'

type Props = {
    path: string
    children: string
}

const BackButton = ({path, children}: Props) => {
    const history = useHistory()

    return (
        <Button
            onClick={() => history.push(path)}
            className={css.backButton}
            fillStyle="ghost"
            intent="secondary"
        >
            <ButtonIconLabel icon="arrow_back">{children}</ButtonIconLabel>
        </Button>
    )
}

export default BackButton
