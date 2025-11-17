import type { ReactNode } from 'react'
import React from 'react'

import classNames from 'classnames'

import checkIconDisabled from 'assets/img/icons/check-circle-disabled.svg'
import checkIcon from 'assets/img/icons/check-circle.svg'
import warningIcon from 'assets/img/icons/warning-big.svg'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'

import css from './style.less'

type Props = {
    children: ReactNode
    count?: number
    id?: string
    isValid?: boolean
    isInvalid?: boolean
    isDisabled?: boolean
    title: string
}

export const StatefulAccordion = ({
    children,
    count,
    id,
    isValid,
    isInvalid,
    isDisabled,
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

    if (isDisabled) {
        state = (
            <img
                className={css.state}
                src={checkIconDisabled}
                alt="disabled icon state"
            />
        )
    }

    return (
        <AccordionItem id={id} isDisabled={isDisabled}>
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
