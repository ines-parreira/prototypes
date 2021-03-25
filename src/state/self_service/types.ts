export type SelfServiceState = {
    self_service_configurations: SelfServiceConfiguration[]
    loading: boolean
}

export type SelfServiceConfiguration = {
    id: number
    type: string
    shop_name: string
    created_datetime: string
    updated_datetime: string
    deactivated_datetime: Maybe<string>
}

export type ApiListResponse<T> = {
    data: T
}
