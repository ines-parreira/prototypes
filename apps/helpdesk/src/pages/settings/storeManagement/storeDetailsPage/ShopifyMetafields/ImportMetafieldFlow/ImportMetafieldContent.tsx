import { useCallback, useEffect, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { Box } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { useNotify } from 'hooks/useNotify'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'

import { METAFIELD_CATEGORIES } from '../constants'
import type { Field } from '../MetafieldsTable/types'
import { getImportResultMessage } from '../utils/getImportResultMessage'
import { isAtMaxFields } from '../utils/isAtMaxFields'
import { useFieldSelection } from './hooks/useFieldSelection'
import { useImportMetafields } from './hooks/useImportMetafields'
import { useImportWizard } from './hooks/useImportWizard'
import ImportableCategories from './ImportableCategories/ImportableCategories'
import ImportDisclaimer from './ImportDisclaimer/ImportDisclaimer'
import MetafieldsImportList from './MetafieldsImportList/MetafieldsImportList'

import styles from './ImportMetafieldFlow.less'

interface ImportMetafieldContentProps {
    onClose: () => void
    importedFields?: Field[]
}

export default function ImportMetafieldContent({
    onClose,
    importedFields,
}: ImportMetafieldContentProps) {
    const { step, selectedCategory, selectCategory, backToCategories } =
        useImportWizard()

    const {
        updateSelection,
        getSelectionForCategory,
        getSelectionCount,
        allSelectedFields,
        clearSelectionForCategory,
    } = useFieldSelection()

    const { mutateAsync: importMetafields } = useImportMetafields()
    const { success, error } = useNotify()

    const categoriesWithCount = useMemo(
        () =>
            METAFIELD_CATEGORIES.map((category) => ({
                ...category,
                selectCount: getSelectionCount(category.value),
            })),
        [getSelectionCount],
    )

    const handleBack = useCallback(() => {
        if (selectedCategory) {
            clearSelectionForCategory(selectedCategory)
        }
        backToCategories()
    }, [selectedCategory, clearSelectionForCategory, backToCategories])

    const handleImport = useCallback(async () => {
        if (allSelectedFields?.length > 0) {
            try {
                const result = await importMetafields({
                    fields: allSelectedFields,
                })

                const notification = getImportResultMessage(
                    result,
                    allSelectedFields.length,
                )
                if (notification.type === 'success') {
                    await success(notification.message)
                } else {
                    await error(notification.message)
                }

                onClose()
            } catch {
                error(
                    'There was an issue adding your Shopify metafields to Gorgias. Please try again.',
                )
            }
        }
    }, [allSelectedFields, importMetafields, success, error, onClose])

    const accountId = useAppSelector(getCurrentAccountId)
    const userId = useAppSelector(getCurrentUserId)

    useEffect(() => {
        logEvent(SegmentEvent.ShopifyMetafieldsOpenImportModal, {
            accountId,
            userId,
        })
    }, [accountId, userId])

    return (
        <>
            <ModalHeader
                className={styles.categoriesModalHeader}
                title="Import Shopify metafields to Gorgias"
            />
            {allSelectedFields?.length > 0 && (
                <Box paddingTop="md" paddingLeft="md" paddingRight="md">
                    <ImportDisclaimer />
                </Box>
            )}
            <ModalBody>
                {step === 'categories' ? (
                    <ImportableCategories
                        categories={categoriesWithCount}
                        onCategorySelect={selectCategory}
                        onImport={handleImport}
                    />
                ) : selectedCategory ? (
                    <MetafieldsImportList
                        category={selectedCategory}
                        selectedMetafields={getSelectionForCategory(
                            selectedCategory,
                        )}
                        onSelectionChange={(fields) =>
                            updateSelection(selectedCategory, fields)
                        }
                        onBack={handleBack}
                        onContinue={backToCategories}
                        importedFields={importedFields}
                        isAtMaxFields={isAtMaxFields(
                            importedFields,
                            selectedCategory,
                        )}
                    />
                ) : null}
            </ModalBody>
        </>
    )
}
