import React from 'react'
import _uniqueId from 'lodash/uniqueId'

import Tooltip from '../../../common/components/Tooltip'
import {HELP_CENTER_MAX_ARTICLES} from '../../helpCenter/constants'

import css from './HelpCenterLabel.less'

type Props = {
    disabled: boolean
}

export default function HelpCenterLabel({disabled}: Props) {
    if (disabled) {
        return <span>No Help center</span>
    }

    const id = _uniqueId('help-center-label-')
    const labels = [
        {
            key: 'max-articles',
            label: `Up to ${HELP_CENTER_MAX_ARTICLES} articles`,
        },
        {
            key: 'custom-domain',
            label: 'Custom domain',
        },
        {
            key: 'multi-language',
            label: 'Multi language',
        },
        {
            key: 'seo-settings',
            label: 'SEO optimization settings',
        },
        {
            key: 'import-export',
            label: 'Easy Import/Export with markdown',
        },
    ]

    return (
        <>
            <div>
                Unlimited{' '}
                <span id={id} className={css.underline}>
                    Help centers
                </span>
            </div>
            <Tooltip
                target={id}
                placement="top-start"
                innerClassName={css.tooltip}
            >
                <div>
                    {labels.map(({key, label}) => (
                        <li key={`${key}-${id}`}>{label}</li>
                    ))}
                </div>
            </Tooltip>
        </>
    )
}
