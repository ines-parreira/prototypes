import cn from 'classnames'

import { Text } from '@gorgias/axiom'

import type { SupportedCategories } from '../types'
import { getCategoryLabel } from '../utils/getCategoryLabel'

import styles from './CategoryChip.less'

type CategoryChipProps = {
    category: SupportedCategories
}

export default function CategoryChip({ category }: CategoryChipProps) {
    return (
        <div
            className={cn(
                styles.category,
                category === 'Customer' && styles.customer,
                category === 'DraftOrder' && styles.draftOrder,
            )}
        >
            <Text variant="bold">{getCategoryLabel(category)}</Text>
        </div>
    )
}
