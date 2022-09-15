import React from 'react'
import Button from '../../common/components/button/Button'
import history from '../../history'
import css from './SelfServiceStatsPage.less'

type Props = {
    title: string
    description: string
    buttonText: string
    buttonRedirectUrl: string
    imageUrl: string
    imageAltText: string
}

export const SelfServiceFeaturePreview = ({
    title,
    description,
    buttonText,
    buttonRedirectUrl,
    imageUrl,
    imageAltText,
}: Props): JSX.Element => {
    return (
        <>
            <div className={css.preview}>
                <div className={css.previewImageContainer}>
                    <img width={246} src={imageUrl} alt={imageAltText} />
                </div>
                <div className={css.previewTextContainer}>
                    <div className={css.title}>{title}</div>
                    <div className={css.description}>{description}</div>
                    <Button onClick={() => history.push(buttonRedirectUrl)}>
                        {buttonText}
                    </Button>
                </div>
            </div>
        </>
    )
}
