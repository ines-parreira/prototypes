import React, { useCallback, useMemo } from 'react'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import { METAFIELD_CATEGORIES } from '../constants'
import { useFieldSelection } from './hooks/useFieldSelection'
import { useImportMetafields } from './hooks/useImportMetafields'
import { useImportWizard } from './hooks/useImportWizard'
import ImportableCategories from './ImportableCategories/ImportableCategories'
import MetafieldsImportList from './MetafieldsImportList/MetafieldsImportList'

import styles from './ImportMetafieldFlow.less'

interface ImportMetafieldFlowProps {
    onClose: () => void
    isOpen: boolean
}

export default function ImportMetafieldFlow({
    onClose,
    isOpen,
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
            await importMetafields({ fields: allSelectedFields })
            clearAllSelections()
            reset()
            onClose()
        }
    }, [
        allSelectedFields,
        importMetafields,
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
                    />
                ) : null}
            </ModalBody>
        </Modal>
    )
}
