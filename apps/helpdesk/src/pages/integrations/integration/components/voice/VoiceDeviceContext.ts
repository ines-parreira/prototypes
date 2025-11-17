import { createContext } from 'react'

import type { State } from 'state/twilio/voiceDevice'

import type { VoiceDeviceActions } from './types'

export type VoiceDeviceContextState = State & { actions: VoiceDeviceActions }

export const Context = createContext<VoiceDeviceContextState | null>(null)
