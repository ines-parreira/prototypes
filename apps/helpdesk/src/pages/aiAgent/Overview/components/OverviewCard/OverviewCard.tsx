import { Card } from 'pages/aiAgent/components/Card'

import css from './OverviewCard.less'

type Props = {
    children: React.ReactNode
    'data-candu-id'?: string
}
export const OverviewCard = ({ children, ...props }: Props) => {
    return (
        <Card className={css.container} data-candu-id={props['data-candu-id']}>
            {children}
        </Card>
    )
}
