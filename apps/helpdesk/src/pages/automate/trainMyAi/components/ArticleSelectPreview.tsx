import React, { useCallback, useState } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import { Paths } from '../../../../rest_api/help_center_api/client.generated'
import ArticleSelect from './ArticleSelect'

import css from './ArticleSelectPreview.less'

type Props = {
    helpCenterId: number
    onSelect: (id: number) => void
    onChange: (id: number) => void
    locale?: Paths.GetCategoryTree.Parameters.Locale
}

const ArticleSelectPreview = ({
    helpCenterId,
    onSelect,
    onChange,
    locale,
}: Props) => {
    const [value, setValue] = useState<number>()

    const handleSubmit = useCallback(() => {
        if (!value) return
        onSelect(value)
    }, [value, onSelect])

    return (
        <div className={css.container}>
            <ArticleSelect
                helpCenterId={helpCenterId}
                onChange={(id) => {
                    onChange(id)
                    setValue(id)
                }}
                locale={locale}
            />
            <Button isDisabled={!value} onClick={handleSubmit}>
                Select Article
            </Button>
        </div>
    )
}

export default ArticleSelectPreview
