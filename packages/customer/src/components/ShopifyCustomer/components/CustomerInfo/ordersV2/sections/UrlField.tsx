import { CopyableField } from '@repo/ecommerce/shopify/components'

import css from './UrlField.less'

type Props = {
    url: string
}

export function UrlField({ url }: Props) {
    return (
        <CopyableField value={url} ariaLabel="Copy URL" inline>
            <a href={url} target="_blank" rel="noreferrer" className={css.url}>
                {url}
            </a>
        </CopyableField>
    )
}
