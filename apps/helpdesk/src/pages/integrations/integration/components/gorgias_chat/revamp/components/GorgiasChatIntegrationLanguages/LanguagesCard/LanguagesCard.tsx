import { useCallback, useState } from 'react'

import { Card, Elevation } from '@gorgias/axiom'

import type { LanguageItem } from 'config/integrations/gorgias_chat'
import type { LanguageItemRow } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationLanguages/types'

import { DeleteLanguageModal } from './DeleteLanguageModal'
import { LanguageCardHeader } from './LanguageCardHeader'
import { LanguageRow } from './LanguageRow'

import css from './LanguagesCard.less'

type Props = {
    languagesRows: LanguageItemRow[]
    isUpdatePending: boolean
    isOneClickInstallation: boolean | undefined
    onClickSetDefault: (language: LanguageItem) => void
    onClickDelete: (language: LanguageItem, onSuccess?: () => void) => void
}

export const LanguagesCard = ({
    languagesRows,
    isUpdatePending,
    isOneClickInstallation,
    onClickSetDefault,
    onClickDelete,
}: Props) => {
    const [languageToDelete, setLanguageToDelete] =
        useState<LanguageItemRow | null>(null)

    const handleDeleteConfirm = useCallback(() => {
        if (languageToDelete) {
            onClickDelete(languageToDelete, () => setLanguageToDelete(null))
        }
    }, [languageToDelete, onClickDelete])

    return (
        <>
            <Card
                elevation={Elevation.Mid}
                className={css.card}
                gap={0}
                padding={0}
            >
                <LanguageCardHeader />
                {languagesRows.map((languageRow) => (
                    <div key={languageRow.language}>
                        <div className={css.separator} />
                        <LanguageRow
                            language={languageRow}
                            isUpdatePending={isUpdatePending}
                            onClickSetDefault={onClickSetDefault}
                            onOpenDeleteModal={setLanguageToDelete}
                        />
                    </div>
                ))}
            </Card>
            <DeleteLanguageModal
                language={languageToDelete}
                isUpdatePending={isUpdatePending}
                isOneClickInstallation={isOneClickInstallation}
                onConfirm={handleDeleteConfirm}
                onDiscard={() => setLanguageToDelete(null)}
            />
        </>
    )
}
