export type MetricCardProps = {
    title: string
}

export function MetricCard(props: MetricCardProps) {
    const { title } = props

    return <div>{title}</div>
}
