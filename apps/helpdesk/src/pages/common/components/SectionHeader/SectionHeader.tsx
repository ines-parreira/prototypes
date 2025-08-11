import { Label } from '@gorgias/axiom'

import css from './SectionHeader.less'

type Props = {
    title: string
    description?: string
}

export default function SectionHeader({ title, description }: Props) {
    return (
        <div className={css.container}>
            <Label>{title}</Label>
            {description && <div>{description}</div>}
        </div>
    )
}
