import React, {ReactNode} from 'react'
import classnames from 'classnames'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import css from './ShowMore.less'

type Props = {
    children: ReactNode
    className?: string
    onClick: () => void
}

export function ShowMore({children, className, onClick}: Props) {
    return (
        <Button
            type="button"
            intent="secondary"
            className={classnames(css.container, className)}
            onClick={onClick}
        >
            <ButtonIconLabel icon="keyboard_double_arrow_down">
                {children}
            </ButtonIconLabel>
        </Button>
    )
}
