import { Badge, IconButton } from '@gorgias/merchant-ui-kit'

import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'

import css from './SettingsFeatureRow.less'

type SettingsFeatureRowProps = {
    title: string
    description: string
    badgeText: string
    nbFeatures?: number
    onClick: () => void
}

export const SettingsFeatureRow = ({
    nbFeatures = 0,
    ...props
}: SettingsFeatureRowProps) => {
    return (
        <div className={css.featureRow} onClick={props.onClick}>
            <div className={css.featureRowContent}>
                <div>{props.title}</div>
                <IconTooltip tooltipProps={{ placement: 'top-start' }}>
                    {props.description}
                </IconTooltip>
            </div>

            <div className={css.featureRowActions}>
                <Badge type={nbFeatures > 0 ? 'light-success' : 'light-dark'}>
                    {props.badgeText}
                </Badge>
                <IconButton
                    icon="keyboard_arrow_right"
                    fillStyle="ghost"
                    size="small"
                />
            </div>
        </div>
    )
}
