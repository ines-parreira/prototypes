import React, {useState, Children, ReactNode} from 'react'
import classnames from 'classnames'
import {Button} from 'reactstrap'

import expandDown from '../../../../../../../img/infobar/expand-down.svg'
import expandUp from '../../../../../../../img/infobar/expand-up-blue.svg'

import css from './ShowMore.less'

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
                    type="button"
                    color="link"
                    className={classnames(css.container, 'pl-0')}
                    onClick={() => setOpen((prevState) => !prevState)}
                >
                    {isOpen ? (
                        <>
                            <img
                                src={expandUp}
                                alt="Contract"
                                className="mr-3"
                            />
                            Less info
                        </>
                    ) : (
                        <>
                            <img
                                src={expandDown}
                                alt="Expand"
                                className="mr-3"
                            />
                            More info
                        </>
                    )}
                </Button>
            )}
        </div>
    )
}
