import React from 'react'
import {Link} from 'react-router-dom'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import css from './NoRelevantArticlePreview.less'

type Props = {
    helpCenterId?: number
}

export default function NoRelevantArticlePreview({helpCenterId}: Props) {
    return (
        <div className={css.container}>
            <p>No relevant articles</p>

            {helpCenterId && (
                <Link
                    to={`/app/settings/help-center/${helpCenterId}/articles?create_article=from_scratch`}
                    target="_blank"
                >
                    <Button size="small">
                        <ButtonIconLabel icon="open_in_new" position="left">
                            Create An Article
                        </ButtonIconLabel>
                    </Button>
                </Link>
            )}
        </div>
    )
}
