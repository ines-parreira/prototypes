export enum ModalState {
    Closed = 'closed',
    UnsavedChanges = 'unsaved-changes',
    DiscardDraft = 'discard-draft',
}

export type KnowledgeEditorGuidanceModalState =
    | {
          type: ModalState.Closed
      }
    | {
          type: ModalState.UnsavedChanges
          onDiscard: () => void
          onBackToEditing: () => void
          onSave: () => Promise<void>
      }
    | {
          type: ModalState.DiscardDraft
          onBackToEditing: () => void
      }
