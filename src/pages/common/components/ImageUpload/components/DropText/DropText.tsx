import classNames from 'classnames'
import React, {FC} from 'react'

import imageIcon from 'assets/img/icons/image-icon.svg'

import {DropZoneProps} from './../../../../components/ImageUpload'
import css from './DropText.less'

type DropTextProps = {
    imageRole?: DropZoneProps['imageRole']
}

export const DropText: FC<DropTextProps> = ({
    imageRole = 'default',
}: DropTextProps) => {
    return (
        <div className={css.wrapper}>
            <img
                className={classNames(css.icon, {
                    [css['icon-small']]: imageRole === 'favicon',
                })}
                src={imageIcon}
                alt="upload"
            />
            {!(imageRole === 'favicon') && (
                <div className={css.text}>
                    <span>Drop your image here, or</span>
                    <span className={css.browseInput}>browse</span>
                </div>
            )}
        </div>
    )
}
