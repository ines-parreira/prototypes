import classNames from 'classnames'
import { Link } from 'react-router-dom'

import { Badge, LegacyIconButton as IconButton } from '@gorgias/axiom'

import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import { NewToggleButton } from 'pages/common/forms/NewToggleButton'

import css from './SettingsFeatureRow.less'

type SettingsFeatureRowProps = {
    title: string
    description?: string
    badgeText?: string
    nbFeatures?: number
    type?: 'badge' | 'link' | 'toggle'
    link?: string
    toggleName?: string
    isChecked?: boolean
    isDisabled?: boolean
    onChange?: (value: boolean) => void
    onClick?: () => void
}

export const SettingsFeatureRow = ({
    title,
    description,
    badgeText,
    nbFeatures = 0,
    type = 'badge',
    isChecked = false,
    isDisabled = false,
    onClick = () => {},
    onChange = () => {},
    link = '',
    toggleName = '',
}: SettingsFeatureRowProps) => {
    return (
        <div
            className={classNames(css.featureRow, {
                [css.disabled]: isDisabled,
            })}
            onClick={onClick}
            data-testid={`settings-feature-row-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
            <div className={css.featureRowContent}>
                <label htmlFor={toggleName}>{title}</label>
                {!!description && (
                    <IconTooltip tooltipProps={{ placement: 'top-start' }}>
                        {description}
                    </IconTooltip>
                )}
            </div>

            {type === 'badge' && (
                <div className={css.featureRowActions}>
                    {!!badgeText && (
                        <Badge
                            type={
                                nbFeatures > 0 ? 'light-success' : 'light-dark'
                            }
                        >
                            {badgeText}
                        </Badge>
                    )}
                    <IconButton
                        iconClassName={css.arrow}
                        isDisabled={isDisabled}
                        icon="keyboard_arrow_right"
                        fillStyle="ghost"
                        size="small"
                    />
                </div>
            )}
            {type === 'link' && (
                <Link className={css.featureRowActions} to={link}>
                    <IconButton
                        isDisabled={isDisabled}
                        icon="open_in_new"
                        fillStyle="ghost"
                        size="small"
                    />
                </Link>
            )}
            {type === 'toggle' && (
                <div className={css.featureRowActions}>
                    <NewToggleButton
                        isDisabled={isDisabled}
                        checked={isChecked}
                        onChange={onChange}
                        name={toggleName}
                    />
                </div>
            )}
        </div>
    )
}
