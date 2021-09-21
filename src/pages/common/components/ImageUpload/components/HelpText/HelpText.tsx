import React, {FunctionComponent} from 'react'

import css from './HelpText.less'

export type HelpTextProps = {
    highlight?: string
    text: string
}

export const HelpText: FunctionComponent<HelpTextProps> = ({
    highlight,
    text,
}: HelpTextProps) => (
    <div className={css.container}>
        {highlight && <span className={css.highlight}>{highlight}</span>}
        <span>{text}</span>
    </div>
)
