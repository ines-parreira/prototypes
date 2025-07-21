import { getIconNameBySign } from 'domains/reporting/pages/utils'

export const TrendIcon = ({ sign }: { sign?: number }) => {
    return (
        <i className="material-icons-round mr-1 icon" style={{ fontSize: 12 }}>
            {getIconNameBySign(sign || 0)}
        </i>
    )
}
