export const DataRow: React.FC<{
    label: string
    value: string | null | undefined
}> = ({ label, value }) => (
    <div>
        <strong>{label}:</strong> {value?.length ? value : '-'}
    </div>
)
