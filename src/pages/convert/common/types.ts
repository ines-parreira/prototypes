import {
    CONVERT_ROUTE_CAMPAIGN_PARAM_NAME,
    CONVERT_ROUTE_PARAM_NAME,
    CONVERT_ROUTE_TEMPLATE_PARAM_NAME,
} from 'pages/convert/common/constants'

export type ConvertRouteParams = {
    [CONVERT_ROUTE_PARAM_NAME]: string
}

export type ConvertRouteCampaignDetailParams = ConvertRouteParams & {
    [CONVERT_ROUTE_CAMPAIGN_PARAM_NAME]?: string
}

export type ConvertRouteTemplateParams = ConvertRouteParams & {
    [CONVERT_ROUTE_TEMPLATE_PARAM_NAME]?: string
}
