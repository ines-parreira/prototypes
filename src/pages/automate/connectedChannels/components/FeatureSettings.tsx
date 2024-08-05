import {Label} from '@gorgias/ui-kit'
import React from 'react'
import classNames from 'classnames'
import {Link} from 'react-router-dom'
import ToggleInput from 'pages/common/forms/ToggleInput'
import css from './FeatureSettings.less'

interface Props {
    enabled: boolean
    title: string
    externalLinkUrl?: string
    subtitle?: string
    label: string
    labelSubtitle?: string
    onToggle?: (value: boolean) => void
}

export const FeatureSettings = ({
    enabled,
    title,
    externalLinkUrl,
    subtitle,
    label,
    labelSubtitle,
    onToggle,
}: Props) => {
    return (
        <div className={css.container}>
            <div className={css.titleWrapper}>
                <Label className={css.title}>{title}</Label>
                {externalLinkUrl && (
                    <Link to={externalLinkUrl} target="_blank" rel="noreferrer">
                        <i className={classNames('material-icons', css.icon)}>
                            open_in_new
                        </i>
                    </Link>
                )}
            </div>
            {labelSubtitle && <span>{labelSubtitle}</span>}
            <ToggleInput
                isToggled={enabled}
                onClick={() => onToggle?.(!enabled)}
                caption={subtitle}
                className={css.toggle}
            >
                {label}
            </ToggleInput>
        </div>
    )
}
