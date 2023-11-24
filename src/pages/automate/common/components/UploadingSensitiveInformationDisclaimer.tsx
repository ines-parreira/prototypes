import classNames from 'classnames'
import React from 'react'

import css from './UploadingSensitiveInformationDisclaimer.less'

type Props = {
    className?: string
    message?: string
}

const UploadingSensitiveInformationDisclaimer = ({
    className,
    message = "If you're uploading files, make sure they don't contain sensitive information.",
}: Props) => (
    <div className={classNames(css.disclaimerContainer, className)}>
        <i role="img" className={classNames('material-icons-round', css.icon)}>
            info
        </i>
        {message}
    </div>
)

export default UploadingSensitiveInformationDisclaimer
