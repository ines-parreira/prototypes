import React, {FunctionComponent, MouseEvent} from 'react'
import classNames from 'classnames'

import css from './HelpText.less'

export type HelpTextProps = {
    text: string
    highlight?: string
    onHighlightClick?: () => void
    onRemoveClick?: (event: MouseEvent<HTMLDivElement>) => void
}

export const HelpText: FunctionComponent<HelpTextProps> = ({
    text,
    highlight,
    onHighlightClick,
    onRemoveClick,
}: HelpTextProps) => (
    <div className={css.container}>
        <div className={css.actions}>
            {highlight && (
                <div
                    className={classNames({
                        [css.highlight]: true,
                        [css.clickable]:
                            typeof onHighlightClick !== 'undefined',
                    })}
                    onClick={onHighlightClick}
                >
                    {highlight}
                </div>
            )}
            {onRemoveClick && (
                <div className={css.removeHighlight} onClick={onRemoveClick}>
                    Remove image
                </div>
            )}
        </div>

        <p>{text}</p>
    </div>
)
