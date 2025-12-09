import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { EmptyState } from '../EmptyState'

import css from './ZendeskImportTable.less'

type TableImportEmailProps = {
    isLoading: boolean
}

export const ZendeskImportTable = ({ isLoading }: TableImportEmailProps) => {
    if (isLoading) {
        return (
            <div className={css.emptyStateWrapper}>
                <LoadingSpinner />
            </div>
        )
    }

    if (!isLoading) {
        return (
            <EmptyState
                title="No Zendesk data imported"
                description="Connect to Zendesk to migrate up to 2 years of data. Once the initial import is complete, your Zendesk data will automatically stay in sync with Gorgias."
                ctaButtonCallback={() => {}}
                ctaButtonLabel="Import Zendesk"
            />
        )
    }
}
