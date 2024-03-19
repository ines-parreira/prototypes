import React from 'react'
import {startCase} from 'lodash'
import {ShopifyMetafield} from '@gorgias/api-types'
import StaticField from 'Infobar/features/Field/display/StaticField'
import CopyButton from 'Infobar/features/Field/components/CopyButton'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import css from './MetaField.less'

type Props = {
    metafield: ShopifyMetafield
}

export default function MetaField({metafield}: Props) {
    const namespace = metafield.namespace || ''
    const key = metafield.key || ''

    switch (metafield.type) {
        case 'url':
        case 'multi_line_text_field':
        case 'single_line_text_field':
        case 'variant_reference':
        case 'file_reference':
        case 'metaobject_reference':
        case 'mixed_reference': {
            return (
                <FieldWithCopyButton
                    label={`${namespace}.${key}`}
                    value={metafield.value}
                />
            )
        }

        case 'date':
        case 'date_time': {
            return (
                <FieldWithCopyButton
                    label={`${namespace}.${key}`}
                    value={metafield.value}
                >
                    <DatetimeLabel dateTime={metafield.value} />
                </FieldWithCopyButton>
            )
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
