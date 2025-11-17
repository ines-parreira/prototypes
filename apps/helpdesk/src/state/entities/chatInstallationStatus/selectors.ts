import type { StoreState } from '../../types'
import type { ChatInstallationStatusState } from './types'

export const getChatInstallationStatus = (
    state: StoreState,
): ChatInstallationStatusState => state.entities.chatInstallationStatus
