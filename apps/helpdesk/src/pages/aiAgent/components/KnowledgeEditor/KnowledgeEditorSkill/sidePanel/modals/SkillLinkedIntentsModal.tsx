import {
    Box,
    Button,
    Heading,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    SearchField,
    Text,
} from '@gorgias/axiom'

import { SkillIntentGroup } from './components/SkillIntentGroup'
import { SkillLinkedIntentsLoadingSkeleton } from './components/SkillLinkedIntentsLoadingSkeleton'
import { useLinkedIntentsModalSkill } from './hooks/useLinkedIntentsModalSkill'

import css from './SkillLinkedIntentsModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export const SkillLinkedIntentsModal = ({ isOpen, onClose }: Props) => {
    const hook = useLinkedIntentsModalSkill(isOpen, onClose)

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={hook.handleModalOpenChange}
            size="sm"
            aria-label="Link intents"
        >
            <OverlayHeader
                title={<Heading size="lg">Link intents</Heading>}
                description={
                    <Text size="md">
                        Select which intents this skill covers. Reassigning an
                        intent from another skill will remove it from that skill
                        or disable it entirely if it&apos;s the only intent
                        left.
                    </Text>
                }
            />
            <OverlayContent width="100%" flexGrow={1} minHeight={0}>
                <Box
                    className={css.modalContent}
                    flexDirection="column"
                    width="100%"
                    height="100%"
                >
                    <SearchField
                        value={hook.searchValue}
                        onChange={hook.setSearchValue}
                        onClear={() => hook.setSearchValue('')}
                        placeholder="Search..."
                        aria-label="Search intents"
                        className={css.searchField}
                    />

                    <Text size="sm" className={css.selectionCount}>
                        {hook.draftIntentIds.length} of {hook.allIntents.length}{' '}
                        intents selected
                    </Text>
                    <div className={css.intentsContainer}>
                        {hook.isLoadingIntents && (
                            <SkillLinkedIntentsLoadingSkeleton />
                        )}

                        {!hook.isLoadingIntents && hook.isIntentsError && (
                            <div className={css.errorState}>
                                <Text size="sm">
                                    We could not load intents.
                                </Text>
                                <Button
                                    size="sm"
                                    variant="tertiary"
                                    onClick={() => hook.onRetryLoadIntents()}
                                >
                                    Try again
                                </Button>
                            </div>
                        )}

                        {!hook.isLoadingIntents &&
                            !hook.isIntentsError &&
                            hook.filteredGroups.map((group) => (
                                <SkillIntentGroup
                                    key={group.name}
                                    group={group}
                                    draftIntentIds={hook.draftIntentIds}
                                    isExpanded={hook.getIsGroupExpanded(
                                        group.name,
                                    )}
                                    isSearching={hook.isSearching}
                                    intentTicketVolumeById={
                                        hook.intentTicketVolumeById
                                    }
                                    initialIntentIds={hook.initialIntentIds}
                                    onToggleExpanded={hook.toggleGroupExpanded}
                                    onToggleIntent={hook.toggleIntent}
                                />
                            ))}
                    </div>
                </Box>
            </OverlayContent>
            <OverlayFooter>
                <Button
                    variant="primary"
                    onClick={hook.saveIntents}
                    isLoading={hook.isSaving}
                    isDisabled={
                        hook.isLoadingIntents ||
                        hook.isSaving ||
                        !hook.hasChanges
                    }
                >
                    Link
                </Button>
            </OverlayFooter>
        </Modal>
    )
}
