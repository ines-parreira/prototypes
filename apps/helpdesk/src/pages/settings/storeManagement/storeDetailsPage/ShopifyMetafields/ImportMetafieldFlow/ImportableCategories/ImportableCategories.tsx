import { Box, Button, Text } from '@gorgias/axiom'

import type { SupportedCategories } from '../../types'

import styles from './ImportableCategories.less'

type CategoryItem = {
    label: string
    value: SupportedCategories
    selectCount: number
}

type ImportableCategoriesProps = {
    categories: CategoryItem[]
    onCategorySelect: (category: SupportedCategories) => void
    onImport: () => void
}

export default function ImportableCategories({
    categories,
    onCategorySelect,
    onImport,
}: ImportableCategoriesProps) {
    const hasAnySelection = categories.some(
        (category) => category.selectCount > 0,
    )
    return (
        <div>
            {categories.map((category) => (
                <div className={styles.categoryContainer} key={category.value}>
                    <Text variant="bold">{category.label}</Text>
                    <div className={styles.actionContainer}>
                        {category.selectCount > 0 ? (
                            <Text>{category.selectCount} selected</Text>
                        ) : null}
                        <Button
                            onClick={() => onCategorySelect(category.value)}
                            aria-label={`Select ${category.label}`}
                            variant="tertiary"
                            icon="arrow-chevron-right"
                        />
                    </div>
                </div>
            ))}
            {hasAnySelection && (
                <Box padding="md" justifyContent="flex-end">
                    <Button onClick={onImport}>Import</Button>
                </Box>
            )}
        </div>
    )
}
