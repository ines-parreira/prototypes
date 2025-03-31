import { ReactNode, useEffect, useRef, useState } from 'react'

import classNames from 'classnames'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import css from './FilterName.less'

type Props = {
    name: string
    className?: string
    warning?: ReactNode
    isDisabled?: boolean
    maxWidth?: number
}

const FilterName = ({
    name,
    className,
    warning = null,
    isDisabled,
    maxWidth = Infinity,
}: Props) => {
    const ref = useRef<HTMLDivElement>(null)
    const [showTooltip, setShowTooltip] = useState(false)

    useEffect(() => {
        const show = ref.current && ref.current.offsetWidth > maxWidth

        setShowTooltip(!!show)
    }, [name, maxWidth])

    return (
        <>
            <div
                ref={ref}
                className={classNames(css.container, className)}
                data-testid="filter-name"
            >
                {warning}
                <div
                    className={classNames(css.text, {
                        [css.disabled]: isDisabled,
                    })}
                >
                    {name}
                </div>
            </div>
            {showTooltip && (
                <Tooltip target={ref}>
                    <div className={css.tooltip}>{name}</div>
                </Tooltip>
            )}
        </>
    )
}

export default FilterName
