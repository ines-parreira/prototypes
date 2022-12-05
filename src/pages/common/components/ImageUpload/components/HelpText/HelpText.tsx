import React, {FunctionComponent, MouseEvent} from 'react'
import classNames from 'classnames'

import css from './HelpText.less'

export type HelpTextProps = {
    text: string
    highlight?: string
    onHighlightClick?: () => void
    onRemoveClick?: (event: MouseEvent<HTMLDivElement>) => void
    className?: string
}

export const HelpText: FunctionComponent<HelpTextProps> = ({
    text,
    highlight,
    onHighlightClick,
    onRemoveClick,
    className,
}: HelpTextProps) => (
    <div className={classNames(css.container, className)}>
        <div className={`${css.actions} hd-help-text-actions`}>
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

        <p className="hd-help-text-text">{text}</p>
    </div>
)
