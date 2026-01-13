import type { ReactNode } from 'react'
import type React from 'react'

import { Button } from '@gorgias/axiom'

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from 'pages/aiAgent/Onboarding_V2/components/Card'

import css from './IntegrationCard.less'

type Props = {
    buttonLabel?: string
    description?: string
    icon?: ReactNode
    onClick?: React.MouseEventHandler
    status?: ReactNode
    title: string
    children?: ReactNode
}

const IntegrationCard: React.FC<Props> = ({
    buttonLabel,
    description,
    icon,
    onClick,
    status,
    title,
    children,
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
                    <div>{children}</div>
                </div>
            </CardContent>

            {buttonLabel && onClick && (
                <CardFooter>
                    <Button
                        variant="primary"
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
