import {Paths} from 'rest_api/workflows_api/client.generated'

export type Action =
    Paths.StoreWfConfigurationControllerList.Responses.$201[number] & {
        creating?: boolean
    }
export type Actions = Action[]
