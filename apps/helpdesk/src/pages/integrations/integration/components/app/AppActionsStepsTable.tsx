import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Text,
} from '@gorgias/axiom'

export type AppActionStep = {
    id: string
    internal_id: string
    name: string
}

type Props = {
    steps: AppActionStep[]
    appIcon?: string
}

export function AppActionsStepsTable({ steps, appIcon }: Props) {
    return (
        <Table withBorder>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {steps.map((step) => (
                    <TableRow key={step.internal_id}>
                        <TableCell>
                            <Box gap="xs" alignItems="center">
                                {appIcon && (
                                    <img
                                        src={appIcon}
                                        alt=""
                                        width={16}
                                        height={16}
                                    />
                                )}
                                <Text>{step.name}</Text>
                            </Box>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
