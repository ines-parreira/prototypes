import { LegacyLabel as Label } from '@gorgias/axiom'
import type { IntegrationType } from '@gorgias/helpdesk-types'

import { DefaultExportSourceIcon as SourceIcon } from 'pages/common/components/SourceIcon'

import css from './CustomBusinessHoursIntegrationCell.less'

type Props = {
    name: string
    address: string | null
    type: IntegrationType
}

export function CustomBusinessHoursIntegrationCell({
    name,
    address,
    type,
}: Props) {
    return (
        <div className={css.container}>
            <Label>{name}</Label>
            <div className={css.address}>
                <SourceIcon type={type} />
                <div className={css.text}>{address}</div>
            </div>
        </div>
    )
}
