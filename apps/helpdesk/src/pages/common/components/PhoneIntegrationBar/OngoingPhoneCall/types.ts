export enum TransferType {
    Agent = 'agent',
    Queue = 'queue',
    External = 'external',
}

export type TransferTarget =
    | { type: TransferType.Agent; id: number }
    | { type: TransferType.Queue; id: number }
    | {
          type: TransferType.External
          value: string
          customer: { id: number; name: string } | null
      }
