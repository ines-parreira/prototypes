import React from 'react'

import css from './MainTitle.less'

interface MainTitleProps {
    titleBlack: string
    titleMagenta: string
}

const MainTitle: React.FC<MainTitleProps> = ({titleBlack, titleMagenta}) => {
    return (
        <h1>
            {titleBlack}{' '}
            <span className={css.titleMagenta}>{titleMagenta}</span>
        </h1>
    )
}

export default MainTitle
