import {Paths, Components} from 'rest_api/migration_api/client.generated'

interface ImportArticlesModalStateNoFileSelected {
    state: 'NO_FILE_SELECTED'
}

interface ImportArticlesModalStateFileSelected {
    state: 'FILE_SELECTED'
    file: File
}

interface ImportArticlesModalStateImporting {
    state: 'IMPORTING'
}

export type ImportArticlesModalState =
    | ImportArticlesModalStateNoFileSelected
    | ImportArticlesModalStateFileSelected
    | ImportArticlesModalStateImporting

export interface FetchedProvidersState {
    data: MigrationProvider[] | null
    isLoading: boolean
    isError: boolean
}

export enum MigrationStatus {
    Connected,
    InProgress,
    Completed,
}

interface ConnectedMigrationState {
    status: MigrationStatus.Connected

    onMigrationStart: () => void
    isMigrationStartLoading: boolean
}

interface InProgressMigrationState {
    status: MigrationStatus.InProgress
    /**
     * Percentage
     */
    progress: number
}

interface CompletedMigrationState {
    status: MigrationStatus.Completed
}

export type MigrationState =
    | ConnectedMigrationState
    | InProgressMigrationState
    | CompletedMigrationState

export type MigrationProviderType = string

export interface MigrationStartPayload {
    type: MigrationProviderType
    [rest: string]: string
}

export interface FetchedMigrationSessionState {
    data: MigrationSession | null
    /**
     * After mounting ImportSection, this is the first loading to check if there is an active session
     */
    isFirstTimeLoading: boolean
}

export type MigrationProvider = Components.Schemas.HelpCenterProvider
export type MigrationProviderField = Components.Schemas.PropertySchema
export type MigrationProviderMeta = Components.Schemas.MigrationProviderMeta

export enum MigrationSessionStatus {
    Pending = 'PENDING',
    Running = 'RUNNING',
    Started = 'STARTED',
    Failure = 'FAILURE',
    Success = 'SUCCESS',
}

// Result field is not present in the short response so merging it as optional field
export type MigrationSession = Components.Schemas.SessionShort &
    Partial<Pick<Components.Schemas.SessionLong, 'result'>>

export type MigrationSessionCreate = Paths.SessionCreate.RequestBody
