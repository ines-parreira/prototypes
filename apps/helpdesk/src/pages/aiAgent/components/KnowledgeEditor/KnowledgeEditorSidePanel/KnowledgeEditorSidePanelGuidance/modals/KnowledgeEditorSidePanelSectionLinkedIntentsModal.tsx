import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    SearchField,
    Text,
} from '@gorgias/axiom'

import type { Components } from 'rest_api/help_center_api/client.generated'

import { IntentGroup } from './components/IntentGroup'
import { LinkedIntentsLoadingSkeleton } from './components/LinkedIntentsLoadingSkeleton'
import { SuggestedIntentsSection } from './components/SuggestedIntentsSection'
import { useLinkedIntentsModal } from './hooks/useLinkedIntentsModal'

import css from './KnowledgeEditorSidePanelSectionLinkedIntentsModal.less'

export type ApiIntent = Components.Schemas.ArticleTranslationIntentDto

export type LinkedIntentGroup = Omit<
    Components.Schemas.ArticleTranslationIntentGroupDto,
    'children'
> & {
    children: ApiIntent[]
}

export type LinkedIntent = ApiIntent

type Props = {
    isOpen: boolean
    onClose: () => void
}

export const KnowledgeEditorSidePanelSectionLinkedIntentsModal = ({
    isOpen,
    onClose,
}: Props) => {
    const {
        searchValue,
        setSearchValue,
        draftIntentIds,
        allIntents,
        filteredGroups,
        suggestedIntents,
        intentTicketCountById,
        isSearching,
        isLoadingIntents,
        isIntentsError,
        isSaving,
        toggleIntent,
        toggleGroupIntents,
        toggleGroupExpanded,
        getIsGroupExpanded,
        onRetryLoadIntents,
        handleSave,
        handleModalOpenChange,
        guidanceEditRoute,
    } = useLinkedIntentsModal(isOpen, onClose)

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleModalOpenChange}
            size="sm"
            aria-label="Link intents"
        >
            <OverlayHeader title="Link intents" />
            <OverlayContent width="100%" flexGrow={1} minHeight={0}>
                <Box
                    className={css.modalContent}
                    flexDirection="column"
                    width="100%"
                    height="100%"
                >
                    <Text size="md" className={css.modalDescription}>
                        AI Agent will only use this guidance to respond to the
                        linked intents, improving response quality and
                        preventing contradictions.
                    </Text>
                    <SearchField
                        value={searchValue}
                        onChange={setSearchValue}
                        onClear={() => setSearchValue('')}
                        placeholder="Search..."
                        aria-label="Search intents"
                        className={css.searchField}
                    />

                    <Text size="sm" className={css.selectionCount}>
                        {draftIntentIds.length} of {allIntents.length} intents
                        selected
                    </Text>
                    <div className={css.intentsContainer}>
                        {isLoadingIntents && <LinkedIntentsLoadingSkeleton />}

                        {!isLoadingIntents && isIntentsError && (
                            <div className={css.errorState}>
                                <Text size="sm">
                                    We could not load intents.
                                </Text>
                                <Button
                                    size="sm"
                                    variant="tertiary"
                                    onClick={() => onRetryLoadIntents()}
                                >
                                    Try again
                                </Button>
                            </div>
                        )}

                        {!isLoadingIntents && !isIntentsError && (
                            <SuggestedIntentsSection
                                suggestedIntents={suggestedIntents}
                                draftIntentIds={draftIntentIds}
                                intentTicketCountById={intentTicketCountById}
                                onToggleIntent={toggleIntent}
                            />
                        )}

                        {!isLoadingIntents &&
                            !isIntentsError &&
                            filteredGroups.map((group) => (
                                <IntentGroup
                                    key={group.name}
                                    group={group}
                                    draftIntentIds={draftIntentIds}
                                    isExpanded={getIsGroupExpanded(group.name)}
                                    isSearching={isSearching}
                                    intentTicketCountById={
                                        intentTicketCountById
                                    }
                                    onToggleGroup={toggleGroupIntents}
                                    onToggleExpanded={toggleGroupExpanded}
                                    onToggleIntent={toggleIntent}
                                    guidanceEditRoute={guidanceEditRoute}
                                />
                            ))}
                    </div>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="tertiary"
                        onClick={onClose}
                        isDisabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        isLoading={isSaving}
                        isDisabled={isLoadingIntents || isSaving}
                    >
                        Save
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
