import React, {ReactNode} from 'react'

import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from 'pages/aiAgent/Onboarding/components/Card'
import Button from 'pages/common/components/button/Button'

import css from './IntegrationCard.less'

type Props = {
    buttonLabel?: string
    description?: string
    icon?: ReactNode
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    status?: ReactNode
    title: string
}

const IntegrationCard: React.FC<Props> = ({
    buttonLabel,
    description,
    icon,
    onClick,
    status,
    title,
}: Props) => {
    return (
        <Card>
            <CardHeader>
                <div className={css.wrapper}>
                    {icon}
                    {status && <div className={css.status}>{status}</div>}
                </div>
            </CardHeader>

            <CardContent>
                <div className={css.text}>
                    <div className={css.title}>{title}</div>
                    <div className={css.description}>{description}</div>
                </div>
            </CardContent>

            {buttonLabel && onClick && (
                <CardFooter>
                    <Button
                        intent="primary"
                        fillStyle="fill"
                        className={css.fullWidth}
                        onClick={onClick}
                    >
                        {buttonLabel}
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}

export default IntegrationCard
