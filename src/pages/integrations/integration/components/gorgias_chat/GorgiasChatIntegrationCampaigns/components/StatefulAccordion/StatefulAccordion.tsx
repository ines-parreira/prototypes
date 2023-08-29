import React, {ReactNode} from 'react'
import classNames from 'classnames'

import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'

import checkIcon from 'assets/img/icons/check-circle.svg'
import warningIcon from 'assets/img/icons/warning-big.svg'

import css from './style.less'

type Props = {
    children: ReactNode
    count?: number
    id?: string
    isValid?: boolean
    isInvalid?: boolean
    title: string
}

export const StatefulAccordion = ({
    children,
    count,
    id,
    isValid,
    isInvalid,
    title,
}: Props) => {
    let state

    if (count) {
        state = <div className={classNames(css.state, css.count)}>{count}</div>
    }

    if (isValid) {
        state = (
            <img className={css.state} src={checkIcon} alt="check icon state" />
        )
    }

    if (isInvalid) {
        state = (
            <img
                className={css.state}
                src={warningIcon}
                alt="warning icon state"
            />
        )
    }

    return (
        <AccordionItem id={id}>
            <AccordionHeader>
                <div className={css.header}>
                    {state}
                    <span className={css.title}>{title}</span>
                </div>
            </AccordionHeader>
            <AccordionBody>{children}</AccordionBody>
        </AccordionItem>
    )
}
