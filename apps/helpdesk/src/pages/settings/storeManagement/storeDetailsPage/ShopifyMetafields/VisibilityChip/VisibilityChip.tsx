import { Text } from '@gorgias/axiom'

import styles from './VisibilityChip.less'

export default function VisibilityChip() {
    return (
        <div className={styles.metafieldHidden}>
            <Text variant="bold">Hidden</Text>
        </div>
    )
}
