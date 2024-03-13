import {CampaignConfiguration, CampaignTemplate} from './types'

export class CampaignConfigurationBuilder {
    private readonly data: CampaignConfiguration

    constructor(
        template: CampaignTemplate,
        configuration: CampaignConfiguration
    ) {
        this.data = {
            ...configuration,
            template_id: template.slug,
        }
    }

    build(): CampaignConfiguration {
        return this.data
    }
}
