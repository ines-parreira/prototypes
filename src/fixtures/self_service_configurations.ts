export const selfServiceConfiguration1 = {
    id: 1,
    type: 'shopify',
    store_name: 'mystore',
    created_datetime: '2021-02-07T06:07:46.097905+00:00',
    updated_datetime: '2021-02-07T09:07:46.097905+00:00',
    deactivated_datetime: null,
}

export const selfServiceConfiguration2 = {
    id: 2,
    type: 'shopify',
    store_name: 'otherstore',
    created_datetime: '2021-02-20T08:15:46.097905+00:00',
    updated_datetime: '2021-02-20T08:20:46.097905+00:00',
    deactivated_datetime: '2021-02-20T08:30:46.097905+00:00',
}

export const selfServiceState = {
    self_service_configurations: [
        selfServiceConfiguration1,
        selfServiceConfiguration2,
    ],
    loading: false,
}

export const updatedSelfServiceConfiguration1 = {
    ...selfServiceConfiguration1,
    deactivated_datetime: '2021-03-01T00:04:20.097905+00:00',
}
