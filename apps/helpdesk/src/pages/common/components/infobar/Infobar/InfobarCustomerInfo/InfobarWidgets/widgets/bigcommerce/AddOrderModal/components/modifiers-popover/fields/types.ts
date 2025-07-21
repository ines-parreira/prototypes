export type FieldProps<Modifier> = {
    modifier: Modifier
    value: number | undefined
    error: string | undefined
    onSetValue: (modifierId: number, optionId: number) => void
}
