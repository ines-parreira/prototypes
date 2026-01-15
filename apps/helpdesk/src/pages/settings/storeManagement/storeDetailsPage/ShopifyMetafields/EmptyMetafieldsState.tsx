import { Heading, Text } from '@gorgias/axiom'

import ImportAction from './MetafieldsTable/ImportAction'

import styles from './EmptyMetafieldsState.less'

type EmptyMetafieldsStateProps = {
    handleOpenCategoriesModal: () => void
}
export default function EmptyMetafieldsState({
    handleOpenCategoriesModal,
}: EmptyMetafieldsStateProps) {
    return (
        <div className={styles.emptyMetafieldsState}>
            <Heading>You haven’t added any metafields yet</Heading>
            <Text as="p" align="center">
                Once you import them, you can manage them here. Please add one
                to use the data in customer profiles, macros, rules, flows,
                views and advanced search.{' '}
            </Text>
            <ImportAction onImportClick={handleOpenCategoriesModal} />
        </div>
    )
}
