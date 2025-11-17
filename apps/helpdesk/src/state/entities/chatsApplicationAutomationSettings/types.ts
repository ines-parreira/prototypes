import type { ChatApplicationAutomationSettings } from 'models/chatApplicationAutomationSettings/types'

export type ChatsApplicationAutomationSettingsState = {
    [applicationId: string]: ChatApplicationAutomationSettings
}
