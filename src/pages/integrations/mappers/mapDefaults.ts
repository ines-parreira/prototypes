import {AppDetail, Category} from 'models/integration/types/app'

export const DEFAULT_VALUES = {
    title: 'App name',
    image: '/img/placeholders/80x80.svg',
    description: 'Short description',
    categories: ['CATEGORY 1' as Category, 'CATEGORY 2' as Category],
    company: {
        name: 'Company name',
        url: 'https://en.wikipedia.org/wiki/Company',
    },
    longDescription: 'Describes app’s capabilities.',
    benefits: ['Benefit #1', 'Benefit #2', 'Benefit #3'],
    screenshots: ['/img/placeholders/1600x900.svg'],
}

export function mapDefaults(config: AppDetail): AppDetail {
    if (!config.isUnapproved) return config
    const configWithDefaults = {...config}
    if (!config.title) {
        configWithDefaults.title = DEFAULT_VALUES.title
    }
    if (!config.image) {
        configWithDefaults.image = DEFAULT_VALUES.image
    }
    if (!config.description) {
        configWithDefaults.description = DEFAULT_VALUES.description
    }
    if (!config.categories?.length) {
        configWithDefaults.categories = DEFAULT_VALUES.categories
    }
    if (!config.company?.name) {
        configWithDefaults.company = DEFAULT_VALUES.company
    }
    if (!config.longDescription) {
        configWithDefaults.longDescription = DEFAULT_VALUES.longDescription
    }
    if (!config.benefits?.length) {
        configWithDefaults.benefits = DEFAULT_VALUES.benefits
    }
    if (!config.screenshots?.length) {
        configWithDefaults.screenshots = DEFAULT_VALUES.screenshots
    }
    return configWithDefaults
}
