import type { ShopifyMetafield } from '@gorgias/helpdesk-queries'

import {
    BooleanMetafield,
    ColorMetafield,
    DateMetafield,
    DateTimeMetafield,
    DimensionMetafield,
    FieldWithCopyButton,
    FieldWrapper,
    JsonMetafield,
    MoneyMetafield,
    RatingMetafield,
    ReferenceMetafield,
    RichTextFieldMetafield,
    UrlMetafield,
} from './MetafieldFields'

type Props = {
    metafield: ShopifyMetafield
}

export default function Metafield({ metafield }: Props) {
    const label = metafield.key || ''

    switch (metafield.type) {
        case 'multi_line_text_field':
        case 'single_line_text_field':
        case 'variant_reference':
        case 'file_reference':
        case 'metaobject_reference':
        case 'mixed_reference':
        case 'number_decimal':
        case 'number_integer': {
            return (
                <FieldWrapper label={label}>
                    <FieldWithCopyButton
                        value={String(metafield.value)}
                        tooltip={
                            metafield.type === 'single_line_text_field' ||
                            metafield.type === 'multi_line_text_field'
                        }
                    />
                </FieldWrapper>
            )
        }

        case 'date': {
            return (
                <FieldWrapper label={label}>
                    <DateMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'date_time': {
            return (
                <FieldWrapper label={label}>
                    <DateTimeMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'boolean': {
            return (
                <FieldWrapper label={label}>
                    <BooleanMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'product_reference':
        case 'collection_reference':
        case 'page_reference': {
            return (
                <FieldWrapper label={label}>
                    <ReferenceMetafield
                        value={metafield.value}
                        type={metafield.type}
                    />
                </FieldWrapper>
            )
        }
        case 'url': {
            return (
                <FieldWrapper label={label}>
                    <UrlMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'color': {
            return (
                <FieldWrapper label={label}>
                    <ColorMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'json': {
            return (
                <FieldWrapper label={label}>
                    <JsonMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'rich_text_field':
            return (
                <FieldWrapper label={label}>
                    <RichTextFieldMetafield value={metafield.value} />
                </FieldWrapper>
            )

        case 'weight':
        case 'volume':
        case 'dimension': {
            return (
                <FieldWrapper label={label}>
                    <DimensionMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'rating': {
            return (
                <FieldWrapper label={label}>
                    <RatingMetafield value={metafield.value} />
                </FieldWrapper>
            )
        }

        case 'money': {
            return (
                <FieldWrapper label={label}>
                    <MoneyMetafield value={metafield} />
                </FieldWrapper>
            )
        }

        case 'list.single_line_text_field':
        case 'list.variant_reference':
        case 'list.file_reference':
        case 'list.metaobject_reference':
        case 'list.mixed_reference':
        case 'list.number_decimal':
        case 'list.number_integer': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return (
                            <FieldWithCopyButton
                                value={String(value)}
                                key={index}
                                tooltip={
                                    metafield.type ===
                                    'list.single_line_text_field'
                                }
                            />
                        )
                    })}
                </FieldWrapper>
            )
        }

        case 'list.date': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return <DateMetafield value={value} key={index} />
                    })}
                </FieldWrapper>
            )
        }

        case 'list.date_time': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return <DateTimeMetafield value={value} key={index} />
                    })}
                </FieldWrapper>
            )
        }

        case 'list.product_reference':
        case 'list.collection_reference':
        case 'list.page_reference': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return (
                            <ReferenceMetafield
                                value={value}
                                type={metafield.type}
                                key={index}
                            />
                        )
                    })}
                </FieldWrapper>
            )
        }

        case 'list.url': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return <UrlMetafield value={value} key={index} />
                    })}
                </FieldWrapper>
            )
        }

        case 'list.color': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return <ColorMetafield value={value} key={index} />
                    })}
                </FieldWrapper>
            )
        }

        case 'list.weight':
        case 'list.volume':
        case 'list.dimension': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return <DimensionMetafield value={value} key={index} />
                    })}
                </FieldWrapper>
            )
        }

        case 'list.rating': {
            return (
                <FieldWrapper label={label}>
                    {metafield.value.map((value, index) => {
                        return <RatingMetafield value={value} key={index} />
                    })}
                </FieldWrapper>
            )
        }

        default: {
            return <></>
        }
    }
}
