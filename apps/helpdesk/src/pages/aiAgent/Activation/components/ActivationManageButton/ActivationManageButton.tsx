import cn from 'classnames'

import { Badge } from '@gorgias/axiom'

import { ActivationProgress } from 'pages/aiAgent/Activation/components/ActivationProgress/ActivationProgress'

import css from './ActivationManageButton.less'

export type LegacyActivationManageButtonProps = {
    onClick: () => void
    progress: number
    variant?: 'flat' | 'bordered'
    hasAiAgentNewActivationXp: false
}
export const LegacyActivationManageButton = ({
    onClick,
    progress,
    variant = 'bordered',
}: Omit<LegacyActivationManageButtonProps, 'hasAiAgentNewActivationXp'>) => {
    const getCaptionText = (activationProgress: number) => {
        if (activationProgress === 0) {
            return 'Activate AI Agent'
        } else if (activationProgress === 100) {
            return 'Fully activated'
        }
        return 'Partially activated'
    }

    const captionText = getCaptionText(progress)
    return (
        <button
            type="button"
            className={cn(css.button, css[variant])}
            onClick={onClick}
        >
            <div className={css.progressStatus}>
                <ActivationProgress
                    className={css.progress}
                    percentage={progress}
                />
                <div className={css.caption}>{captionText}</div>
            </div>
            <div className={css.separator} />
            <div className={css.label}>
                Manage <i className="material-icons">chevron_right</i>
            </div>
        </button>
    )
}

export type ActivationManageButtonBorderedProps = {
    hasAiAgentNewActivationXp: true
    onClick: () => void
    variant: 'bordered'
}
export type ActivationManageButtonFlatProps = {
    hasAiAgentNewActivationXp: true
    onClick: () => void
    variant: 'flat'
    status: 'live' | 'off'
}
export type ActivationManageButtonProps =
    | ActivationManageButtonBorderedProps
    | ActivationManageButtonFlatProps
type Props = ActivationManageButtonProps | LegacyActivationManageButtonProps

const ActivationManageButtonBordered = ({
    onClick,
}: Omit<
    ActivationManageButtonBorderedProps,
    'variant' | 'hasAiAgentNewActivationXp'
>) => {
    return (
        <button
            type="button"
            className={cn(css.button, css.bordered)}
            onClick={onClick}
        >
            <div className={css.label}>
                AI Agent Status <i className="material-icons">chevron_right</i>
            </div>
        </button>
    )
}

const ActivationManageButtonFlat = ({
    onClick,
    status,
}: Omit<
    ActivationManageButtonFlatProps,
    'variant' | 'hasAiAgentNewActivationXp'
>) => {
    return (
        <button
            type="button"
            className={cn(css.button, css.flat)}
            onClick={onClick}
        >
            <div className={css.tag}>
                AI Agent Status{' '}
                {status === 'live' && (
                    <Badge type={'light-success'}>LIVE</Badge>
                )}
                {status === 'off' && <Badge type={'light-dark'}>OFF</Badge>}
            </div>
        </button>
    )
}

export const ActivationManageButton = (props: Props) => {
    if (!props.hasAiAgentNewActivationXp) {
        return (
            <LegacyActivationManageButton
                onClick={props.onClick}
                progress={props.progress}
                variant={props.variant}
            />
        )
    }

    if (props.variant === 'flat') {
        return (
            <ActivationManageButtonFlat
                onClick={props.onClick}
                status={props.status}
            />
        )
    }

    return <ActivationManageButtonBordered onClick={props.onClick} />
}
