import { LegacyIconButton as IconButton, Text } from '@gorgias/axiom'

import styles from './CategoriesList.less'

type MetafieldCategory = 'customers' | 'orders' | 'draftOrders'

const metafieldCategories: {
    label: string
    value: MetafieldCategory
    selectCount?: number
}[] = [
    {
        label: 'Customers',
        value: 'customers',
        selectCount: 5,
    },
    {
        label: 'Orders',
        value: 'orders',
        selectCount: 0,
    },
    {
        label: 'Draft Orders',
        value: 'draftOrders',
        selectCount: 0,
    },
]

export default function CategoriesList() {
    return (
        <div>
            {metafieldCategories.map((category) => (
                <div className={styles.categoryContainer} key={category.value}>
                    <Text variant="bold">{category.label}</Text>
                    <div className={styles.actionContainer}>
                        {category.selectCount ? (
                            <Text>{category.selectCount} selected</Text>
                        ) : null}
                        <IconButton
                            icon="chevron_right"
                            intent="secondary"
                            fillStyle="ghost"
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}
