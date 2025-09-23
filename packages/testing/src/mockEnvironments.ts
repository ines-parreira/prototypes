export const mockProductionEnvironment = () => {
    window.DEVELOPMENT = false
    window.STAGING = false
    window.PRODUCTION = true
}

export const mockStagingEnvironment = () => {
    window.DEVELOPMENT = false
    window.STAGING = true
    window.PRODUCTION = false
}

export const mockDevelopmentEnvironment = () => {
    window.DEVELOPMENT = true
    window.STAGING = false
    window.PRODUCTION = false
}
