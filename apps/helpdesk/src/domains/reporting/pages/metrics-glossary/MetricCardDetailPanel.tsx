import {
    Banner,
    Box,
    OverlayContent,
    OverlayHeader,
    SidePanel,
    Skeleton,
    Text,
} from '@gorgias/axiom'
import { useGetMetricCard } from '@gorgias/helpdesk-queries'

type MetricCardDetailPanelProps = {
    slug: string | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function MetricCardDetailPanel({
    slug,
    isOpen,
    onOpenChange,
}: MetricCardDetailPanelProps) {
    const { data, isLoading } = useGetMetricCard(slug ?? '', {
        query: { enabled: Boolean(slug) },
    })

    const card = data?.data

    return (
        <SidePanel isOpen={isOpen} onOpenChange={onOpenChange}>
            <OverlayHeader
                title={card?.title ?? <Skeleton height={32} width={200} />}
            />
            <OverlayContent>
                {isLoading || !card ? (
                    <Box
                        flexDirection="column"
                        gap="lg"
                        width={'100%'}
                        paddingTop="sm"
                    >
                        <Skeleton height={32} count={5} />
                    </Box>
                ) : (
                    <Box flexDirection="column" gap="lg">
                        <Text color="content-neutral-secondary">
                            {card.public.definition}
                        </Text>
                        <Banner
                            title={<Text variant="bold">Formula</Text>}
                            description={
                                <Text variant="italic">
                                    {card.public.formula}
                                </Text>
                            }
                            isClosable={false}
                        />

                        <Box flexDirection="column" gap="sm">
                            <Text variant="bold">How it&apos;s computed</Text>
                            <Box flexDirection="column" gap="xxxs">
                                {card.public.computation_logic.map((entry) => (
                                    <Text
                                        key={entry}
                                        color="content-neutral-secondary"
                                    >
                                        &#x2022; {entry}
                                    </Text>
                                ))}
                            </Box>
                        </Box>

                        <Text color="purple" size="sm">
                            Give feedback
                        </Text>
                    </Box>
                )}
            </OverlayContent>
        </SidePanel>
    )
}
