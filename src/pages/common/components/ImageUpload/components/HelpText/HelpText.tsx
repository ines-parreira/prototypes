import React, {FunctionComponent} from 'react'
import classNames from 'classnames'

import css from './HelpText.less'

export type HelpTextProps = {
    text: string
    highlight?: string
    onHighlightClick?: () => void
}

export const HelpText: FunctionComponent<HelpTextProps> = ({
    text,
    highlight,
    onHighlightClick,
}: HelpTextProps) => (
    <div className={css.container}>
        {highlight && (
            <span
                className={classNames({
                    [css.highlight]: true,
                    [css.clickable]: typeof onHighlightClick !== 'undefined',
                })}
                onClick={onHighlightClick}
            >
                {highlight}
            </span>
        )}
        <br />
        <span>{text}</span>
    </div>
)
