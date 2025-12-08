import css from './Feature.less'

export type ProductFeatureProps =
    | {
          title: string
          description: string
          icon: string
      }
    | {
          title: string
          description: string
          iconUrl: string
      }
const Feature = ({
    title,
    description,
    ...featureProps
}: ProductFeatureProps) => {
    return (
        <div className={css.feature}>
            <div className={css.icon}>
                {'icon' in featureProps ? (
                    <i className="material-icons">{featureProps.icon}</i>
                ) : (
                    <img src={featureProps.iconUrl} alt={title} />
                )}
            </div>
            <div className={css.content}>
                <div className="body-semibold">{title}</div>
                <div>{description}</div>
            </div>
        </div>
    )
}

export default Feature
