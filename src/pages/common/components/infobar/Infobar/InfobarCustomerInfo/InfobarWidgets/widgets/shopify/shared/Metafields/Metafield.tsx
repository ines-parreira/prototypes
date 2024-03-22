import React from 'react'
import {startCase} from 'lodash'
import {ShopifyMetafield} from '@gorgias/api-types'
import StaticField from 'Infobar/features/Field/display/StaticField'
import CopyButton from 'Infobar/features/Field/components/CopyButton'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import Badge from 'gorgias-design-system/Badge/Badge'
import css from './Metafield.less'

type Props = {
    metafield: ShopifyMetafield
}

export default function Metafield({metafield}: Props) {
    const namespace = metafield.namespace || ''
    const key = metafield.key || ''
    const label = namespace ? `${namespace}.${key}` : key

    switch (metafield.type) {
        case 'url':
        case 'multi_line_text_field':
        case 'single_line_text_field':
        case 'variant_reference':
        case 'file_reference':
        case 'metaobject_reference':
        case 'mixed_reference': {
            return <FieldWithCopyButton label={label} value={metafield.value} />
        }

        case 'date':
        case 'date_time': {
            return (
                <FieldWithCopyButton label={label} value={metafield.value}>
                    <DatetimeLabel dateTime={metafield.value} />
                </FieldWithCopyButton>
            )
        }

        case 'boolean': {
            const value = metafield.value ? 'true' : 'false'
            return (
                <FieldWithCopyButton label={label} value={value}>
                    <Badge
                        label={value}
                        color={'accessoryGreen'}
                        className={css.badge}
                    />
                </FieldWithCopyButton>
            )
        }

        case 'color': {
            return <ColorMetafield label={label} value={metafield.value} />
        }

        default: {
            return <></>
        }
    }
}

type FieldWithCopyButtonProps = {
    children?: React.ReactNode
    label: string
    value: string
}

function FieldWithCopyButton({
    label,
    value,
    children,
}: FieldWithCopyButtonProps) {
    return (
        <div className={css.field}>
            <StaticField label={startCase(label)}>
                {children ?? value}
                <span className={css.copyButton}>
                    <CopyButton value={value} />
                </span>
            </StaticField>
        </div>
    )
}

function ColorMetafield({label, value}: {label: string; value: string}) {
    return (
        <div className={css.field}>
            <StaticField label={startCase(label)}>
                <svg className={css.colorBadge}>
                    <circle
                        cx={7}
                        cy={7}
                        r={6.665}
                        stroke={value}
                        strokeWidth={0}
                        fill={value}
                    />
                </svg>
                <span className={css.colorValue}>{value}</span>
            </StaticField>
            <span className={css.copyButton}>
                <CopyButton value={value} />
            </span>
        </div>
    )
}
