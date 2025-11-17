import type { ReactNode } from 'react'
import React from 'react'

import { Card, CardBody } from 'reactstrap'

import css from './GenericCard.less'

type Props = {
    children: ReactNode
}

export default function GenericCard({ children }: Props) {
    return (
        <Card className={css.genericCard}>
            <CardBody>{children}</CardBody>
        </Card>
    )
}
