import { Link } from 'react-router-dom'

import Button from 'pages/common/components/button/Button'

import css from './ConvertOnboardingStep.less'

type Props = {
    number: number
    title: string
    description: string
    action: string
    actionLink?: string
    isDisabled: boolean
    isCompleted: boolean
    onClick?: () => void
}

const ConvertOnboardingStep = ({
    number,
    title,
    description,
    action,
    actionLink,
    isDisabled,
    isCompleted,
    onClick,
}: Props) => {
    return (
        <div className={css.box}>
            {isCompleted ? (
                <div>
                    <i
                        className="material-icons text-success"
                        style={{ fontSize: 24 }}
                        aria-label="Step completed"
                    >
                        check_circle
                    </i>
                </div>
            ) : (
                <div className={css.number}>{number}</div>
            )}
            <div className={css.title}>
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
            {!isCompleted && (
                <div className={css.action}>
                    {!!actionLink ? (
                        <Link to={actionLink} onClick={onClick}>
                            <Button fillStyle="ghost" isDisabled={isDisabled}>
                                {action}
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            fillStyle="ghost"
                            isDisabled={isDisabled}
                            onClick={onClick}
                        >
                            {action}
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}

export default ConvertOnboardingStep
