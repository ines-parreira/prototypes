export type Notification<T = unknown> = {
    id: string
    inserted_datetime: string
    read_datetime: string | null
    seen_datetime: string | null
    type: string
    payload: T
}

export type RawNotification<T = unknown> = Omit<Notification<T>, 'id'>
