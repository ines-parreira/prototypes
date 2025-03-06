import React from 'react'

import css from './MainTitle.less'

interface MainTitleProps {
    titleBlack: string
    titleMagenta: string
    className?: string
    secondaryTitle?: string
}

const MainTitle: React.FC<MainTitleProps> = ({
    titleBlack,
    titleMagenta,
    className,
    secondaryTitle,
}) => {
    return (
        <h1 className={className}>
            {titleBlack}{' '}
            <span className={css.titleMagenta}>{titleMagenta}</span>
            {secondaryTitle && <> {secondaryTitle}</>}
        </h1>
    )
}

export default MainTitle
