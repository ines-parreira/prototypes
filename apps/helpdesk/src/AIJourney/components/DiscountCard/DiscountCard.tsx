import { useHistory, useParams } from 'react-router-dom'

import sphereIcon from 'assets/img/ai-journey/sphere.svg'

import css from './DiscountCard.less'

export const DiscountCard = () => {
    const history = useHistory()
    const { shopName } = useParams<{ shopName: string }>()

    return (
        <div className={css.discountCard}>
            <div className={css.content}>
                <div className={css.title}>
                    <img src={sphereIcon} alt="sphere-icon" />

                    <span>Immediate win</span>
                </div>
                Enable the Discount Codes to boost conversion by 18% (+$5k)
            </div>
            <button
                className={css.redirectIcon}
                onClick={() => {
                    history.push(
                        `/app/ai-journey/${shopName}/conversation-setup`,
                    )
                }}
            >
                <i className="material-icons-outlined">arrow_forward</i>
            </button>
        </div>
    )
}
