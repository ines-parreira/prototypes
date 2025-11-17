import { useMemo } from 'react'

import { EntityType } from 'hooks/useSearchRankScenario'
import type { PickedCustomerWithHighlights } from 'models/search/types'
import { customerHighlightsTransform } from 'pages/common/components/Spotlight/helpers'
import css from 'pages/common/components/Spotlight/SpotlightCustomerRow.less'
import SpotlightRow from 'pages/common/components/Spotlight/SpotlightRow'
import { sanitizeHtmlDefault } from 'utils/html'

type SpotlightCustomerRowProps = {
    item: PickedCustomerWithHighlights
    onCloseModal: () => void
    id: number
    index: number
    selected?: boolean
    onClick: () => void
}
const SpotlightCustomerRow = ({
    item,
    onCloseModal,
    id,
    index,
    selected,
    onClick,
}: SpotlightCustomerRowProps) => {
    const itemWithHighlights = useMemo(
        () => customerHighlightsTransform(item),
        [item],
    )

    return (
        <SpotlightRow
            id={id}
            index={index}
            title={
                itemWithHighlights.name || `Customer #${itemWithHighlights.id}`
            }
            info={
                <SpotlightCustomerInfo
                    email={itemWithHighlights.email}
                    phone={itemWithHighlights.phoneNumberOrAddress}
                />
            }
            link={`/app/customer/${id}`}
            onCloseModal={onCloseModal}
            selected={selected}
            shrinkInfo
            onClick={onClick}
            entityType={EntityType.Customer}
            entityId={itemWithHighlights.orderId}
        />
    )
}

const SpotlightCustomerInfo = ({
    email,
    phone,
}: {
    email: string | null
    phone?: string
}) => {
    if (!email && !phone) {
        return null
    }

    return (
        <div className={css.customerInfo}>
            {!!email && (
                <span
                    className={css.infoText}
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHtmlDefault(email),
                    }}
                />
            )}
            {!!phone && (
                <>
                    <span className={css.infoSeparator}>•</span>
                    <span
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtmlDefault(phone),
                        }}
                    />
                </>
            )}
        </div>
    )
}

export default SpotlightCustomerRow
