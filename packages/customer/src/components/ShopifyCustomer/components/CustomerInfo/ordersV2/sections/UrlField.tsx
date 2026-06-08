import { CopyableField } from '@repo/ecommerce/shopify/components'

import { Box } from '@gorgias/axiom'

import css from './UrlField.less'

type Props = {
    url: string
}

export function UrlField({ url }: Props) {
    return (
        <CopyableField value={url} ariaLabel="Copy URL" inline>
            <Box display="inline-block" width="100%">
                <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className={css.url}
                >
                    {url}
                </a>
            </Box>
        </CopyableField>
    )
}
