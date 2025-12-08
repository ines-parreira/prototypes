export enum ModalState {
    Closed = 'closed',
    UnsavedChanges = 'unsaved-changes',
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
