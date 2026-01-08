import React, { useCallback, useMemo } from 'react'

import pluralize from 'pluralize'

import { Box } from '@gorgias/axiom'

import { useNotify } from 'hooks/useNotify'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import { METAFIELD_CATEGORIES } from '../constants'
import type { Field } from '../MetafieldsTable/types'
import { isAtMaxFields } from '../utils/isAtMaxFields'
import { useFieldSelection } from './hooks/useFieldSelection'
import { useImportMetafields } from './hooks/useImportMetafields'
import { useImportWizard } from './hooks/useImportWizard'
import ImportableCategories from './ImportableCategories/ImportableCategories'
import ImportDisclaimer from './ImportDisclaimer/ImportDisclaimer'
import MetafieldsImportList from './MetafieldsImportList/MetafieldsImportList'

import styles from './ImportMetafieldFlow.less'

interface ImportMetafieldFlowProps {
    onClose: () => void
    isOpen: boolean
    importedFields?: Field[]
}

export default function ImportMetafieldFlow({
    onClose,
    isOpen,
    importedFields,
}: ImportMetafieldFlowProps) {
    const { step, selectedCategory, selectCategory, backToCategories, reset } =
        useImportWizard()

    const {
        updateSelection,
        getSelectionForCategory,
        getSelectionCount,
        allSelectedFields,
        clearSelectionForCategory,
        clearAllSelections,
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
                await importMetafields({ fields: allSelectedFields })
                success(
                    `Success! ${allSelectedFields.length} ${pluralize('metafield', allSelectedFields.length)} added`,
                )
                clearAllSelections()
                reset()
                onClose()
            } catch {
                error(
                    'There was an issue adding your Shopify metafields to Gorgias. Please try again.',
                )
            }
        }
    }, [
        allSelectedFields,
        importMetafields,
        success,
        error,
        clearAllSelections,
        onClose,
        reset,
    ])

    const handleClose = useCallback(() => {
        clearAllSelections()
        reset()
        onClose()
    }, [clearAllSelections, reset, onClose])

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="large"
            classNameContent={styles.categoriesModalContent}
        >
            <ModalHeader
                className={styles.categoriesModalHeader}
                title="Import Shopify metafields to Gorgias"
            />
            {allSelectedFields?.length > 0 && (
                <Box padding="md">
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
        </Modal>
    )
}
