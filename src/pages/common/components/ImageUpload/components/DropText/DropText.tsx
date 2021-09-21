import React, {FunctionComponent} from 'react'

import imageIcon from '../../../../../../../img/icons/image-icon.svg'

import css from './DropText.less'

export const DropText: FunctionComponent = () => {
    return (
        <div className={css.wrapper}>
            <img className={css.icon} src={imageIcon} alt="upload" />
            <div className={css.text}>
                <span>Drop your image here, or</span>
                <span className={css.browseInput}>browse</span>
            </div>
        </div>
    )
}
