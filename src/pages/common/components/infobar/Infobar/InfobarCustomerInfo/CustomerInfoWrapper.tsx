import React, {Children, ReactNode, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import css from './CustomerInfoWrapper.less'

type Props = {
    children: ReactNode
    displayedElementsCount?: number
}

export default function CustomerInfoWrapper({
    children,
    displayedElementsCount = 2,
}: Props) {
    const array = Children.toArray(children)
    const count = array.length
    const [isOpen, setOpen] = useState(false)

    return (
        <div>
            {isOpen ? children : array.slice(0, displayedElementsCount)}
            {count <= displayedElementsCount ? null : (
                <Button
                    intent="secondary"
                    className={css.container}
                    onClick={() => setOpen((prevState) => !prevState)}
                >
                    {isOpen ? (
                        <ButtonIconLabel icon="keyboard_double_arrow_up">
                            Less info
                        </ButtonIconLabel>
                    ) : (
                        <ButtonIconLabel icon="keyboard_double_arrow_down">
                            More info
                        </ButtonIconLabel>
                    )}
                </Button>
            )}
        </div>
    )
}
