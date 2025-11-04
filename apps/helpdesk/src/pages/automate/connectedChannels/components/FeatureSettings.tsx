import classNames from 'classnames'
import { Link } from 'react-router-dom'

import {
    LegacyButton as Button,
    LegacyLabel as Label,
    LegacyToggleField as ToggleField,
} from '@gorgias/axiom'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import css from './FeatureSettings.less'

interface BaseProps {
    enabled: boolean
    title: string
    subtitle?: string
    label: string
    labelSubtitle?: string
    disabled?: boolean
    onToggle?: (value: boolean) => void
    isLoading?: boolean
}

interface WithConfigurationAlert extends BaseProps {
    showConfigurationRequiredAlert: true
    externalLinkUrl: string
}

interface WithoutConfigurationAlert extends BaseProps {
    showConfigurationRequiredAlert?: false
    externalLinkUrl?: string
}

type Props = WithConfigurationAlert | WithoutConfigurationAlert

export const FeatureSettings = ({
    enabled,
    title,
    externalLinkUrl,
    subtitle,
    isLoading,
    label,
    labelSubtitle,
    showConfigurationRequiredAlert,
    disabled,
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
            <div className={css.toggleContainer}>
                <ToggleField
                    isDisabled={disabled}
                    value={enabled}
                    isLoading={isLoading}
                    onChange={() => onToggle?.(!enabled)}
                    caption={subtitle}
                    className={css.toggle}
                    label={label}
                />
                {showConfigurationRequiredAlert && (
                    <Link to={externalLinkUrl}>
                        <Button fillStyle="ghost" size="small">
                            <ButtonIconLabel
                                icon="warning"
                                className={css.warningText}
                            >
                                Configuration Required
                            </ButtonIconLabel>
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    )
}
