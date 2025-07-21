import {
    SelfServiceConfiguration,
    ShopType,
} from '../models/selfServiceConfiguration/types'

export const selfServiceConfiguration1: SelfServiceConfiguration = {
    id: 1,
    type: 'shopify' as ShopType,
    shopName: 'mystore',
    createdDatetime: '2021-02-07T06:07:46.097905+00:00',
    updatedDatetime: '2021-02-07T09:07:46.097905+00:00',
    deletedDatetime: null,
    reportIssuePolicy: {
        enabled: false,
        cases: [],
    },
    trackOrderPolicy: {
        enabled: false,
    },
    returnOrderPolicy: {
        enabled: false,
        eligibilities: [],
        exceptions: [],
    },
    cancelOrderPolicy: {
        enabled: false,
        eligibilities: [],
        exceptions: [],
    },
    articleRecommendationHelpCenterId: 30,
}

export const selfServiceConfiguration2: SelfServiceConfiguration = {
    id: 2,
    type: 'shopify' as ShopType,
    shopName: 'otherstore',
    createdDatetime: '2021-02-20T08:15:46.097905+00:00',
    updatedDatetime: '2021-02-20T08:20:46.097905+00:00',
    deletedDatetime: '2021-02-20T08:30:46.097905+00:00',
    reportIssuePolicy: {
        enabled: true,
        cases: [],
    },
    trackOrderPolicy: {
        enabled: true,
    },
    returnOrderPolicy: {
        enabled: true,
        eligibilities: [],
        exceptions: [],
    },
    cancelOrderPolicy: {
        enabled: true,
        eligibilities: [],
        exceptions: [],
    },
    articleRecommendationHelpCenterId: null,
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
    deactivatedDatetime: '2021-03-01T00:04:20.097905+00:00',
}
