import classNames from 'classnames'
import React, {FC} from 'react'

import imageIcon from '../../../../../../../img/icons/image-icon.svg'

import css from './DropText.less'

type DropTextProps = {
    size?: 'default' | 'small'
}

export const DropText: FC<DropTextProps> = ({
    size = 'default',
}: DropTextProps) => {
    return (
        <div className={css.wrapper}>
            <img
                className={classNames(css.icon, {
                    [css['icon-small']]: size === 'small',
                })}
                src={imageIcon}
                alt="upload"
            />
            {!(size === 'small') && (
                <div className={css.text}>
                    <span>Drop your image here, or</span>
                    <span className={css.browseInput}>browse</span>
                </div>
            )}
        </div>
    )
}
