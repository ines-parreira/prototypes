import { useState } from 'react'

import { ItemSelectionDrawer } from './ItemSelectionDrawer'

export const SelectedItemsDrawer = ({
    title,
    itemLabelPlural,
    items,
    isOpen,
    hasImages,
    type,
    onClose,
    onSubmit,
}: {
    title: string
    itemLabelPlural: string
    items: Array<{
        id: string
        title: string
        img?: string
        status?: string
    }>
    isOpen: boolean
    hasImages: boolean
    type?: 'promote' | 'exclude'
    onClose: () => void
    onSubmit: (itemsIds: string[]) => Promise<void>
}) => {
    const [drawerConfig, setDrawerConfig] = useState<{
        page: number
        search: string
    }>({
        page: 1,
        search: '',
    })

    const filteredItems = items.filter((item) =>
        drawerConfig.search !== ''
            ? item.title
                  .toLowerCase()
                  .includes(drawerConfig.search.toLowerCase())
            : true,
    )

    return (
        <ItemSelectionDrawer
            isOpen={isOpen}
            isLoading={false}
            hasImages={hasImages}
            title={title}
            itemLabelPlural={itemLabelPlural}
            selectedItemIds={items.map((item) => item.id)}
            type={type}
            onClose={onClose}
            onSubmit={onSubmit}
            items={filteredItems.slice(
                (drawerConfig.page - 1) * 25,
                drawerConfig.page * 25,
            )}
            pagination={{
                hasNextPage: filteredItems.length > drawerConfig.page * 25,
                hasPrevPage: drawerConfig.page > 1,
                onNextClick: () =>
                    setDrawerConfig((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                    })),
                onPrevClick: () =>
                    setDrawerConfig((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                    })),
            }}
            onSearch={(search) =>
                setDrawerConfig({
                    page: 1,
                    search,
                })
            }
        />
    )
}
