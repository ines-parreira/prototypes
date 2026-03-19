import type { ReactNode } from 'react'

import { Card, Elevation, Heading, HeadingSize } from '@gorgias/axiom'

import css from './TranslateSection.less'

type Props = {
    title: string
    children: ReactNode
}

export const TranslateSection = ({ title, children }: Props) => {
    return (
        <Card elevation={Elevation.Mid} className={css.card}>
            <Heading size={HeadingSize.Sm}>{title}</Heading>
            <div className={css.rows}>{children}</div>
        </Card>
    )
}
