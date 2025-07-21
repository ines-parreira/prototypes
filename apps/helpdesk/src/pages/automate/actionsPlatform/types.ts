import { IntegrationType } from 'models/integration/constants'
import { Paths } from 'rest_api/workflows_api/client.generated'

export type ActionTemplate =
    Awaited<Paths.WfConfigurationTemplateControllerList.Responses.$200>[number]
export type ActionTemplateApp = ActionTemplate['apps'][number]
export type ActionsApp = Awaited<Paths.AppControllerList.Responses.$200>[number]

export type App =
    | {
          id: string
          type: IntegrationType.Shopify
          name: string
          icon: string
      }
    | {
          id: string
          type: IntegrationType.Recharge
          name: string
          icon: string
      }
    | {
          id: string
          type: IntegrationType.App
          name: string
          icon: string
      }
