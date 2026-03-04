import { Skeleton, Tile, TileContent, TileHeader } from '@gorgias/axiom'

export function TicketListItemSkeleton() {
    return (
        <Tile type="no-border">
            <TileHeader
                trailingSlot={<Skeleton width={75} />}
                subtitle={<Skeleton width="65%" />}
            >
                <Skeleton width={98} />
            </TileHeader>
            <TileContent>
                <Skeleton />
            </TileContent>
        </Tile>
    )
}
