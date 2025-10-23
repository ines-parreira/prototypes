import cn from 'classnames'

import { Text } from '@gorgias/axiom'

import { MetafieldCategory } from '../types'
import getLabelFromCategory from './getLabelFromCategory'

import styles from './CategoryChip.less'

type CategoryChipProps = {
    category: MetafieldCategory
}

export default function CategoryChip({ category }: CategoryChipProps) {
    return (
        <div
            className={cn(
                styles.category,
                category === 'customer' && styles.customer,
                category === 'draft_order' && styles.draftOrder,
            )}
        >
            <Text variant="bold">{getLabelFromCategory(category)}</Text>
        </div>
    )
}
