import type React from 'react'
import { createRef, useContext } from 'react'

import { DateAndTimeFormatting } from '@repo/utils'
import { isArray, map, truncate } from 'lodash'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'
import type {
    DimensionShopifyMetafieldData,
    MoneyShopifyMetafield,
    RatingShopifyMetafieldData,
    VolumeShopifyMetafieldData,
    WeightShopifyMetafieldData,
} from '@gorgias/helpdesk-queries'
import type { MetafieldType } from '@gorgias/helpdesk-types'

import CopyButton from 'components/CopyButton/CopyButton'
import { Badge } from 'gorgias-design-system/Badge/Badge'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { StaticField } from 'Widgets/modules/Template/modules/Field'

import { extractGid, prepareGidUrl } from '../helpers/Gid'
import { shortenUrl } from '../helpers/shortenUrl'

import css from './Metafield.less'

export type MetafieldProps = {
    value: string
}

export function UrlMetafield({ value }: MetafieldProps) {
    return (
        <FieldWithCopyButton value={value}>
            <a href={value} target="_blank" rel="noreferrer">
                {shortenUrl(value)}
            </a>
        </FieldWithCopyButton>
    )
}

export function DateMetafield({ value }: MetafieldProps) {
    return (
        <FieldWithCopyButton value={value}>
            <DatetimeLabel
                dateTime={value}
                hasTooltip={false}
                labelFormat={DateAndTimeFormatting.ShortDateWithYear}
            />
        </FieldWithCopyButton>
    )
}

export function DateTimeMetafield({ value }: MetafieldProps) {
    return (
        <FieldWithCopyButton value={value}>
            <DatetimeLabel
                dateTime={value}
                hasTooltip={false}
                labelFormat={DateAndTimeFormatting.ShortDateWithYear}
            />
            {' ('}
            <DatetimeLabel
                dateTime={value}
                hasTooltip={false}
                labelFormat={DateAndTimeFormatting.TimeDoubleDigitHour}
            />
            {')'}
        </FieldWithCopyButton>
    )
}

export function BooleanMetafield({ value }: { value: boolean }) {
    const text = value ? 'true' : 'false'
    const color = value ? 'accessoryGreen' : 'accessoryRed'
    return (
        <FieldWithCopyButton value={text}>
            <Badge label={text} color={color} className={css.badge} />
        </FieldWithCopyButton>
    )
}

export function DimensionMetafield({
    value,
}: {
    value:
        | DimensionShopifyMetafieldData
        | VolumeShopifyMetafieldData
        | WeightShopifyMetafieldData
}) {
    let unit = String(value.unit)
    if (unit === 'l') {
        unit = 'L'
    } else {
        unit = unit.replace(/_/g, ' ').replace(/us/g, '').replace(/3/g, '³')
    }
    const copiableValue = `${value.value} ${unit}`

    return <FieldWithCopyButton value={copiableValue} />
}

export function RatingMetafield({
    value,
}: {
    value: RatingShopifyMetafieldData
}) {
    const copiableValue = `${value.value} out of ${value.scale_max}`
    return <FieldWithCopyButton value={copiableValue} />
}

export function MoneyMetafield({ value }: { value: MoneyShopifyMetafield }) {
    const copiableValue = `${value.value.amount} ${value.value.currency_code}`
    return (
        <FieldWithCopyButton value={copiableValue}>
            <MoneyAmount
                renderIfZero
                amount={copiableValue}
                currencyCode={value.value.currency_code}
            />
        </FieldWithCopyButton>
    )
}

export function ColorMetafield({ value }: MetafieldProps) {
    return (
        <FieldWithCopyButton value={value}>
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
        </FieldWithCopyButton>
    )
}

export function ReferenceMetafield({
    value,
    type,
}: {
    value: string
    type: MetafieldType | string
}) {
    const integrationContext = useContext(IntegrationContext)
    const gid = extractGid(value)
    const storeName = integrationContext?.integration?.get('name')
    if (storeName && gid) {
        const url = prepareGidUrl(type, storeName as string, gid)
        return url ? (
            <FieldWithCopyButton value={gid}>
                <a href={url} target="_blank" rel="noreferrer">
                    {gid}
                </a>
            </FieldWithCopyButton>
        ) : null
    }
    return null
}

export function LinkMetafield({
    value,
}: {
    value: { text: string; url: string }
}) {
    const displayText = value.text || shortenUrl(value.url)
    return (
        <FieldWithCopyButton value={value.url}>
            <a href={value.url} target="_blank" rel="noreferrer">
                {displayText}
            </a>
        </FieldWithCopyButton>
    )
}

export function RichTextFieldMetafield({
    value,
}: {
    value: Record<string, unknown>
}) {
    const render = (node: Record<string, unknown>): string => {
        if ('type' in node && 'value' in node && node.type === 'text') {
            return String(node.value)
        }

        if (isArray(node.children)) {
            return map(node.children, render).join(' ')
        }

        return ''
    }
    const compactValue = render(value)

    return <FieldWithCopyButton value={compactValue} tooltip={true} />
}

export function JsonMetafield({ value }: { value: Record<string, unknown> }) {
    const formattedJson = JSON.stringify(value, null, 4)
    return <FieldWithCopyButton value={formattedJson} tooltip={true} />
}

export function FieldWithCopyButton({
    value,
    children,
    tooltip,
}: {
    value: string
    children?: React.ReactNode
    tooltip?: boolean
}) {
    const ref = createRef<HTMLDivElement>()
    const shortenedValue = truncate(value, { length: 80 })
    const isTrimmed = value.length > 80
    return (
        <>
            <div className={css.field} ref={ref}>
                {children ?? shortenedValue}
                <span className={css.copyButton}>
                    <CopyButton value={value} />
                </span>
            </div>
            {isTrimmed && tooltip && (
                <Tooltip target={ref} placement="top">
                    <pre className={css.tooltip}>{value}</pre>
                </Tooltip>
            )}
        </>
    )
}

export function FieldWrapper({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
    return (
        <div className={css.fieldWrapper}>
            <StaticField label={label}>{children}</StaticField>
        </div>
    )
}
