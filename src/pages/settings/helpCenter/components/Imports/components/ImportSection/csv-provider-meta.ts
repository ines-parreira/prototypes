import fileIconSrc from 'assets/img/icons/file-icon.svg'
import {MigrationProviderMeta} from './types'

// CSV will not be fetched from API and will be stored locally for convenience
export const csvProviderMeta: MigrationProviderMeta = {
    title: 'CSV',
    logo_url: fileIconSrc,

    // These are not used
    docs_url: '',
    site_url: '',
}
