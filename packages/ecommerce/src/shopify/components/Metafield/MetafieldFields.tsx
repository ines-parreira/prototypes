import { Box, Tag } from '@gorgias/axiom'
import type { MetafieldType } from '@gorgias/helpdesk-types'

import { CopyableField } from '../CopyableField'
import { extractGid, prepareGidUrl } from './helpers/Gid'
import { shortenUrl } from './helpers/shortenUrl'
import { formatDate, formatDateTime } from './metafieldUtils'

import css from './MetafieldValue.less'

export type MetafieldProps = {
    value: string
}

export function UrlMetafield({ value }: MetafieldProps) {
    return (
        <CopyableField value={value}>
            <a href={value} target="_blank" rel="noreferrer">
                {value}
            </a>
        </CopyableField>
    )
}

export function DateMetafield({ value }: MetafieldProps) {
    return <CopyableField value={value}>{formatDate(value)}</CopyableField>
}

export function DateTimeMetafield({ value }: MetafieldProps) {
    return <CopyableField value={value}>{formatDateTime(value)}</CopyableField>
}

export function BooleanMetafield({ value }: { value: boolean }) {
    const text = value ? 'true' : 'false'
    return (
        <CopyableField value={text}>
            <Tag color={value ? 'green' : 'red'}>{text}</Tag>
        </CopyableField>
    )
}

export function DimensionMetafield({
    value,
}: {
    value: { value: number | string; unit: string }
}) {
    let unit = String(value.unit)
    if (unit === 'l') {
        unit = 'L'
    } else {
        unit = unit.replace(/_/g, ' ').replace(/us/g, '').replace(/3/g, '³')
    }
    const copiableValue = `${value.value} ${unit}`
    return <CopyableField value={copiableValue} />
}

export function RatingMetafield({
    value,
}: {
    value: { value: string | number; scale_max: string | number }
}) {
    const copiableValue = `${value.value} out of ${value.scale_max}`
    return <CopyableField value={copiableValue} />
}

export function MoneyMetafield({
    value,
}: {
    value: { amount: string; currency_code: string }
}) {
    const copiableValue = `${value.amount} ${value.currency_code}`
    return <CopyableField value={copiableValue} />
}

export function ColorMetafield({ value }: MetafieldProps) {
    return (
        <CopyableField value={value}>
            <Box flexDirection="row" alignItems="center" gap="xxs">
                <span
                    className={css.colorSwatch}
                    style={{ backgroundColor: value }}
                />
                <span>{value}</span>
            </Box>
        </CopyableField>
    )
}

export function ReferenceMetafield({
    value,
    type,
    storeName,
}: {
    value: string
    type: MetafieldType | string
    storeName?: string
}) {
    const gid = extractGid(value)
    if (!gid) return null

    if (storeName) {
        const url = prepareGidUrl(type, storeName, gid)
        if (url) {
            return (
                <CopyableField value={gid}>
                    <a href={url} target="_blank" rel="noreferrer">
                        {gid}
                    </a>
                </CopyableField>
            )
        }
    }

    return <CopyableField value={gid} />
}

export function LinkMetafield({
    value,
}: {
    value: { text: string; url: string }
}) {
    const displayText = value.text || shortenUrl(value.url)
    return (
        <CopyableField value={value.url}>
            <a href={value.url} target="_blank" rel="noreferrer">
                {displayText}
            </a>
        </CopyableField>
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
        if (Array.isArray(node.children)) {
            return (node.children as Record<string, unknown>[])
                .map(render)
                .join(' ')
        }
        return ''
    }
    const compactValue = render(value)
    return <CopyableField value={compactValue} tooltip={true} />
}

export function JsonMetafield({ value }: { value: Record<string, unknown> }) {
    const formattedJson = JSON.stringify(value, null, 4)
    return <CopyableField value={formattedJson} tooltip={true} />
}
