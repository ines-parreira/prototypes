import {Components, Paths} from 'rest_api/revenue_addon_api/client.generated'

export type SettingsParams = (
    | Paths.GetSettings.PathParameters
    | Paths.UpdateSetting.PathParameters
) & {setting_type?: string}

export type SettingsListParams = Paths.GetSettings.QueryParameters

export type Setting = Components.Schemas.SettingResponseSchema

export type SettingRequest = Components.Schemas.RequestSettingSchema
