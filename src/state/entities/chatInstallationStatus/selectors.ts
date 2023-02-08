import {StoreState} from '../../types'
import {ChatInstallationStatusState} from './types'

export const getChatInstallationStatus = (
    state: StoreState
): ChatInstallationStatusState => state.entities.chatInstallationStatus
