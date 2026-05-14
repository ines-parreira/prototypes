import type React from 'react'

import {
    Box,
    Button,
    Card,
    CardHeader,
    ListItem,
    SelectField,
    Text,
    TextField,
} from '@gorgias/axiom'

import { ProductSelect } from 'AIJourney/components/ProductSelect/ProductSelect'
import type {
    MessageFormAction,
    MessageFormState,
} from 'AIJourney/types/RcsTestSend'
import type { Product } from 'constants/integrations/types/shopify'

import { BUTTON_TYPES, stripHtml } from '../../pages/RcsTestSend/reducer'

import css from '../../pages/RcsTestSend/RcsTestSend.less'

type RcsMessageCardProps = {
    form: MessageFormState
    dispatch: React.Dispatch<MessageFormAction>
    shopName: string
}

export const RcsMessageCard = ({
    form,
    dispatch,
    shopName,
}: RcsMessageCardProps) => {
    const hasProducts = form.productEntries.some(
        (e) => e.shopifyProduct != null,
    )
    const hasImage = form.image.trim().length > 0

    const handleProductSelect = (id: string, product: Product | undefined) => {
        const entry = form.productEntries.find((e) => e.id === id)
        dispatch({
            type: 'UPDATE_PRODUCT',
            id,
            patch: {
                shopifyProduct: product,
                body: product?.body_html
                    ? stripHtml(product.body_html)
                    : (entry?.body ?? ''),
                url: product?.handle
                    ? `https://${shopName}/products/${product.handle}`
                    : (entry?.url ?? ''),
            },
        })
    }

    return (
        <Card>
            <CardHeader title="Message" />
            <Box flexDirection="column" gap="md">
                <TextField
                    label="Text"
                    caption="Required — message body"
                    value={form.contextText}
                    onChange={(val) =>
                        dispatch({ type: 'SET_TEXT', payload: val })
                    }
                    isRequired
                />
                <TextField
                    label="Title"
                    caption="Optional — rich card title"
                    value={form.contextTitle}
                    onChange={(val) =>
                        dispatch({ type: 'SET_TITLE', payload: val })
                    }
                />

                <div className={css.section}>
                    <Text className={css.sectionLabel}>Image (optional)</Text>
                    <TextField
                        label="Image URL"
                        caption={
                            hasProducts
                                ? 'Cannot be used together with products'
                                : 'Direct URL to image'
                        }
                        value={form.image}
                        onChange={(val) =>
                            dispatch({ type: 'SET_IMAGE', payload: val })
                        }
                        isDisabled={hasProducts}
                    />
                </div>

                <div className={css.section}>
                    <Text className={css.sectionLabel}>Buttons (up to 5)</Text>
                    {form.buttons.map((btn, i) => (
                        <div key={btn.id} className={css.arrayItem}>
                            <div className={css.arrayItemHeader}>
                                <Text className={css.sectionLabel}>
                                    Button {i + 1}
                                </Text>
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        dispatch({
                                            type: 'REMOVE_BUTTON',
                                            id: btn.id,
                                        })
                                    }
                                >
                                    Remove
                                </Button>
                            </div>
                            <SelectField
                                label="Type"
                                items={BUTTON_TYPES}
                                value={
                                    BUTTON_TYPES.find(
                                        (t) => t.id === btn.type,
                                    ) ?? BUTTON_TYPES[0]
                                }
                                onChange={(
                                    item: (typeof BUTTON_TYPES)[number],
                                ) =>
                                    dispatch({
                                        type: 'UPDATE_BUTTON',
                                        id: btn.id,
                                        patch: { type: item.id },
                                    })
                                }
                            >
                                {(item: (typeof BUTTON_TYPES)[number]) => (
                                    <ListItem
                                        key={item.id}
                                        id={item.id}
                                        label={item.label}
                                        textValue={item.label}
                                    />
                                )}
                            </SelectField>
                            <TextField
                                label="Text"
                                caption="Button label"
                                value={btn.text}
                                onChange={(val) =>
                                    dispatch({
                                        type: 'UPDATE_BUTTON',
                                        id: btn.id,
                                        patch: { text: val },
                                    })
                                }
                            />
                            <TextField
                                label="Value"
                                caption="URL or quick reply payload"
                                value={btn.value ?? ''}
                                onChange={(val) =>
                                    dispatch({
                                        type: 'UPDATE_BUTTON',
                                        id: btn.id,
                                        patch: { value: val },
                                    })
                                }
                            />
                        </div>
                    ))}
                    {form.buttons.length < 5 && (
                        <Button
                            variant="secondary"
                            leadingSlot="add"
                            onClick={() => dispatch({ type: 'ADD_BUTTON' })}
                        >
                            Add button
                        </Button>
                    )}
                </div>

                <div className={css.section}>
                    <Text className={css.sectionLabel}>
                        Products (up to 10)
                    </Text>
                    {form.productEntries.map((entry, i) => (
                        <div key={entry.id} className={css.arrayItem}>
                            <div className={css.arrayItemHeader}>
                                <Text className={css.sectionLabel}>
                                    Product {i + 1}
                                </Text>
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        dispatch({
                                            type: 'REMOVE_PRODUCT',
                                            id: entry.id,
                                        })
                                    }
                                >
                                    Remove
                                </Button>
                            </div>
                            <ProductSelect
                                selectedProduct={entry.shopifyProduct}
                                setSelectedProduct={(product) =>
                                    handleProductSelect(entry.id, product)
                                }
                            />
                            <TextField
                                label="Body"
                                caption="Auto-filled from product description — editable"
                                value={entry.body}
                                onChange={(val) =>
                                    dispatch({
                                        type: 'UPDATE_PRODUCT',
                                        id: entry.id,
                                        patch: { body: val },
                                    })
                                }
                            />
                            <TextField
                                label="URL"
                                caption="Auto-filled from product handle — editable"
                                value={entry.url}
                                onChange={(val) =>
                                    dispatch({
                                        type: 'UPDATE_PRODUCT',
                                        id: entry.id,
                                        patch: { url: val },
                                    })
                                }
                            />
                        </div>
                    ))}
                    {form.productEntries.length < 10 && (
                        <Box flexDirection="column" gap="xs">
                            <Button
                                variant="secondary"
                                leadingSlot="add"
                                isDisabled={hasImage}
                                onClick={() =>
                                    dispatch({ type: 'ADD_PRODUCT' })
                                }
                            >
                                Add product
                            </Button>
                            {hasImage && (
                                <Text className={css.mutualExclusionNote}>
                                    Clear the image to add products
                                </Text>
                            )}
                        </Box>
                    )}
                </div>
            </Box>
        </Card>
    )
}
