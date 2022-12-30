import {Integration} from 'models/integration/types'

export const getDefaultRoutes = (
    baseURL: string,
    integrations: Integration[]
) => {
    const isAboutDefault = integrations.length === 0

    return {
        about: isAboutDefault
            ? [baseURL, `${baseURL}/about`]
            : [`${baseURL}/about`],
        integrations: isAboutDefault
            ? [`${baseURL}/integrations`]
            : [baseURL, `${baseURL}/integrations`],
    }
}
