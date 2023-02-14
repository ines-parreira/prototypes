import classNames from 'classnames'
import React from 'react'

import {MigrationProvider} from '../../types'

import css from './ProviderInfo.less'

type Props = {
    className?: string
    onClick?: () => void
    provider: MigrationProvider
}

const ProviderInfo: React.FC<Props> = ({className, provider, onClick}) => {
    return (
        <div className={classNames(className, css.wrapper)} onClick={onClick}>
            <img
                alt={provider.title}
                src={provider.logo_url}
                className={css.logo}
            />
            <div>
                <div className={css.title}>{provider.title}</div>
                <div className={css.url}>{provider.site_url}</div>
            </div>
        </div>
    )
}

export default ProviderInfo
