import { IntegrationType } from '@gorgias/helpdesk-types'
import { Label } from '@gorgias/merchant-ui-kit'

import SourceIcon from 'pages/common/components/SourceIcon'

import css from './CustomBusinessHoursIntegrationCell.less'

type Props = {
    name: string
    address?: string
    type: IntegrationType
}

export default function CustomBusinessHoursIntegrationCell({
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
