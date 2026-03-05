import { Box } from '@gorgias/axiom'

import {
    BooleanMetafield,
    ColorMetafield,
    DateMetafield,
    DateTimeMetafield,
    DimensionMetafield,
    FieldWithCopyButton,
    JsonMetafield,
    LinkMetafield,
    MoneyMetafield,
    RatingMetafield,
    ReferenceMetafield,
    RichTextFieldMetafield,
    UrlMetafield,
} from './MetafieldFields'
import type { FullShopifyMetafield } from './types'

type Props = {
    metafield: FullShopifyMetafield
    storeName?: string
}

export function MetafieldValue({ metafield, storeName }: Props) {
    switch (metafield.type) {
        case 'multi_line_text_field':
        case 'single_line_text_field':
            return (
                <FieldWithCopyButton
                    value={String(metafield.value)}
                    tooltip={true}
                />
            )

        case 'variant_reference':
        case 'file_reference':
        case 'metaobject_reference':
        case 'mixed_reference':
        case 'number_decimal':
        case 'number_integer':
        case 'id':
            return <FieldWithCopyButton value={String(metafield.value)} />

        case 'date':
            return <DateMetafield value={metafield.value} />

        case 'date_time':
            return <DateTimeMetafield value={metafield.value} />

        case 'boolean':
            return <BooleanMetafield value={metafield.value} />

        case 'product_reference':
        case 'collection_reference':
        case 'page_reference':
        case 'customer_reference':
        case 'company_reference':
            return (
                <ReferenceMetafield
                    value={metafield.value as string}
                    type={metafield.type}
                    storeName={storeName}
                />
            )

        case 'link':
            return (
                <LinkMetafield
                    value={metafield.value as { text: string; url: string }}
                />
            )

        case 'url':
            return <UrlMetafield value={metafield.value} />

        case 'color':
            return <ColorMetafield value={metafield.value} />

        case 'json':
            return (
                <JsonMetafield
                    value={metafield.value as Record<string, unknown>}
                />
            )

        case 'rich_text_field':
            return (
                <RichTextFieldMetafield
                    value={metafield.value as Record<string, unknown>}
                />
            )

        case 'weight':
        case 'volume':
        case 'dimension':
            return (
                <DimensionMetafield
                    value={
                        metafield.value as {
                            value: number | string
                            unit: string
                        }
                    }
                />
            )

        case 'rating':
            return (
                <RatingMetafield
                    value={
                        metafield.value as {
                            value: string | number
                            scale_max: string | number
                        }
                    }
                />
            )

        case 'money':
            return (
                <MoneyMetafield
                    value={
                        metafield.value as {
                            amount: string
                            currency_code: string
                        }
                    }
                />
            )

        case 'list.single_line_text_field':
        case 'list.variant_reference':
        case 'list.file_reference':
        case 'list.metaobject_reference':
        case 'list.mixed_reference':
        case 'list.number_decimal':
        case 'list.number_integer':
            return (
                <Box flexDirection="column" gap="xxs">
                    {(metafield.value as unknown[]).map((value, index) => (
                        <FieldWithCopyButton
                            key={index}
                            value={String(value)}
                            tooltip={
                                metafield.type === 'list.single_line_text_field'
                            }
                        />
                    ))}
                </Box>
            )

        case 'list.date':
            return (
                <Box flexDirection="column" gap="xxs">
                    {metafield.value.map((v, index) => (
                        <DateMetafield key={index} value={v} />
                    ))}
                </Box>
            )

        case 'list.date_time':
            return (
                <Box flexDirection="column" gap="xxs">
                    {metafield.value.map((v, index) => (
                        <DateTimeMetafield key={index} value={v} />
                    ))}
                </Box>
            )

        case 'list.product_reference':
        case 'list.collection_reference':
        case 'list.page_reference':
        case 'list.customer_reference':
        case 'list.company_reference':
            return (
                <Box flexDirection="column" gap="xxs">
                    {(metafield.value as string[]).map((value, index) => (
                        <ReferenceMetafield
                            key={index}
                            value={value}
                            type={metafield.type}
                            storeName={storeName}
                        />
                    ))}
                </Box>
            )

        case 'list.url':
            return (
                <Box flexDirection="column" gap="xxs">
                    {metafield.value.map((v, index) => (
                        <UrlMetafield key={index} value={v} />
                    ))}
                </Box>
            )

        case 'list.link':
            return (
                <Box flexDirection="column" gap="xxs">
                    {(
                        metafield.value as Array<{ text: string; url: string }>
                    ).map((v, index) => (
                        <LinkMetafield key={index} value={v} />
                    ))}
                </Box>
            )

        case 'list.color':
            return (
                <Box flexDirection="column" gap="xxs">
                    {metafield.value.map((color, index) => (
                        <ColorMetafield key={index} value={color} />
                    ))}
                </Box>
            )

        case 'list.weight':
        case 'list.volume':
        case 'list.dimension':
            return (
                <Box flexDirection="column" gap="xxs">
                    {metafield.value.map((v, index) => (
                        <DimensionMetafield key={index} value={v} />
                    ))}
                </Box>
            )

        case 'list.rating':
            return (
                <Box flexDirection="column" gap="xxs">
                    {metafield.value.map((v, index) => (
                        <RatingMetafield key={index} value={v} />
                    ))}
                </Box>
            )

        default:
            return null
    }
}
