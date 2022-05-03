
export interface InternalMessage {
  occurredAt:Date,
  id:BigInt,
  display:string,
  data?:object|undefined,
}