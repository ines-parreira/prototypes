import { Button } from '@gorgias/axiom'

import css from '../ImportEmail.less'

type EmptyStateProps = {
    onOpenCreateImportModal: () => void
}

const EmptyState = ({ onOpenCreateImportModal }: EmptyStateProps) => (
    <div className={css.emptyStateWrapper}>
        <h3 className={css.subTitle}>No emails imported</h3>
        <p>Select an email to get started.</p>
        <Button onClick={onOpenCreateImportModal}>Import Email</Button>
    </div>
)

export default EmptyState
