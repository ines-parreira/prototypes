import React from 'react'
import {Link} from 'react-router-dom'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'
import {generateVariantName} from 'pages/convert/abVariants/utils/generateVariantName'

import {
    abVariantControlVariantUrl,
    abVariantEditorUrl,
} from 'pages/convert/abVariants/urls'

import css from './ABGroupVariants.less'

type Props = {
    integrationId: string
    campaignId: string
    variants: CampaignVariant[] | null | undefined
}

const ABGroupVariants: React.FC<Props> = ({
    integrationId,
    campaignId,
    variants,
}) => {
    return (
        <>
            <TableBodyRow>
                <BodyCell style={{width: 88}}></BodyCell>
                <BodyCell>
                    <Link
                        className={css.link}
                        to={abVariantControlVariantUrl(
                            integrationId,
                            campaignId
                        )}
                    >
                        <b>Control Variant</b>
                    </Link>
                </BodyCell>
            </TableBodyRow>
            {(variants ?? []).map((variant, idx) => (
                <TableBodyRow key={`variant-${idx}`}>
                    <BodyCell style={{width: 88}}></BodyCell>
                    <BodyCell>
                        <Link
                            className={css.link}
                            to={abVariantEditorUrl(
                                integrationId,
                                campaignId,
                                variant.id as string
                            )}
                        >
                            <b>{generateVariantName(idx)}</b>
                        </Link>
                    </BodyCell>
                </TableBodyRow>
            ))}
        </>
    )
}

export default ABGroupVariants
