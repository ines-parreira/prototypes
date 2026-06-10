import { useEffect, useRef } from 'react'

import { CopyableField } from '@repo/ecommerce/shopify/components'

import { Box, Button, Dot, Icon, StickyLayer, Text } from '@gorgias/axiom'

import css from './OrderRowHeader.less'

type Props = {
    orderName: string
    dateLabel: string
    itemCount: number
    total: string
    isExpanded: boolean
    onToggle: () => void
    shopifyUrl?: string
}

export function OrderRowHeader({
    orderName,
    dateLabel,
    itemCount,
    total,
    isExpanded,
    onToggle,
    shopifyUrl,
}: Props) {
    const headerRef = useRef<HTMLDivElement | null>(null)
    const wasExpandedRef = useRef(isExpanded)
    const wasStuckOnToggleRef = useRef(false)

    useEffect(() => {
        if (
            wasExpandedRef.current &&
            !isExpanded &&
            wasStuckOnToggleRef.current
        ) {
            headerRef.current?.scrollIntoView({
                block: 'start',
                behavior: 'smooth',
            })
        }
        wasExpandedRef.current = isExpanded
        wasStuckOnToggleRef.current = false
    }, [isExpanded])

    return (
        <StickyLayer isSticky={isExpanded} group="shopify-header">
            {({ ref: stickyRef, stickyProps, stuck, offset }) => {
                function handleToggle() {
                    wasStuckOnToggleRef.current = stuck
                    onToggle()
                }

                const className = isExpanded
                    ? `${css.header} ${css.sticky}`
                    : css.header

                return (
                    <div
                        ref={(el) => {
                            headerRef.current = el
                            stickyRef(el)
                        }}
                        {...stickyProps}
                        data-stuck={isExpanded && stuck ? 'true' : undefined}
                        className={className}
                        style={{
                            ...stickyProps?.style,
                            scrollMarginTop: offset,
                        }}
                        onClick={isExpanded ? handleToggle : undefined}
                    >
                        <Box
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="space-between"
                            gap="xs"
                        >
                            <Box
                                flexDirection="row"
                                alignItems="center"
                                gap="xxxs"
                                minWidth={0}
                            >
                                <Icon name="app-shopify" size="md" />
                                <CopyableField
                                    value={orderName}
                                    ariaLabel="Copy order number"
                                    inline
                                >
                                    <Text
                                        size="md"
                                        variant="bold"
                                        className={css.orderNumber}
                                    >
                                        {orderName}
                                    </Text>
                                </CopyableField>
                            </Box>
                            <Box
                                flexDirection="row"
                                alignItems="center"
                                gap={0}
                            >
                                {shopifyUrl && (
                                    <Button
                                        as="a"
                                        href={shopifyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        icon="external-link"
                                        variant="tertiary"
                                        size="md"
                                        aria-label="Open in Shopify"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                )}
                                <Button
                                    as="button"
                                    icon={
                                        isExpanded
                                            ? 'arrow-chevron-up'
                                            : 'arrow-chevron-down'
                                    }
                                    variant="tertiary"
                                    size="md"
                                    aria-expanded={isExpanded}
                                    aria-label={
                                        isExpanded
                                            ? 'Collapse order'
                                            : 'Expand order'
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleToggle()
                                    }}
                                />
                            </Box>
                        </Box>
                        <Box
                            flexDirection="row"
                            alignItems="center"
                            gap="xxs"
                            className={css.metadata}
                        >
                            <Text as="span" size="md">
                                {dateLabel}
                            </Text>
                            <Dot size="sm" />
                            <Text
                                as="span"
                                size="md"
                            >{`${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}</Text>
                            <Dot size="sm" />
                            <Text as="span" size="md">
                                {total}
                            </Text>
                        </Box>
                    </div>
                )
            }}
        </StickyLayer>
    )
}
