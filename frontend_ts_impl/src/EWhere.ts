import { IsIId } from "./Id"

export type DWhere = ["NOT", DWhere] | AndOrOpData | OpData

export type AndOrOpData = ["AND" | "OR", DWhere[]]

// export const newEWheres = <T extends unknown[]>(tableCount: number, data: DWhere[]) => {
//   return [...Array(tableCount)].map((_, i) => newEWhere(i, data))
// }

// const isAndOrOp = (data: DWhere): data is AndOrOpData =>
//   data[0] == "AND" || data[0] == "OR"

// const isEmptyLogic = (data: DWhere) => isAndOrOp(data) && !data[1].length

const sym_data = Symbol("symDWhere")
export const getWhereData = (pxy: EWhere<_>): DWhere => pxy[sym_data as never]

const sym_data_logic = Symbol("symDWhereLogic")

export const newEWhere = <T>(tblNav: string[]): EWhere<T> => {
  let data: DWhere[] = []
  const logic_stack = [0]
  throw "todo"
}

type OpArgs = string | number | Date | undefined | null | OpFn | EWhere
function convertValue(v: OpArgs) {
  // if (v === undefined) { return null }
  if (v instanceof Date) { return v.toJSON() }

  const where_data = (v as never)[sym_data]
  if (where_data) { return where_data }

  return v
}


export interface EWheresFn<T, TRet = T> {
  (f: EWhere<T>): EWhere<TRet>
}

// /** Entities Where */
// type EWheres<T extends unknown[]> = { [K in keyof T]: EWhere<T[K]> }

type EWhereKey = keyof EWhere

export type EWhere<T = unknown> = LogicOpFn<T> & EWhereProp<T> & EWhereSym

type EWhereSym = {
  [sym_data]: DWhere[]
  [sym_data_logic]: DWhere[]
}

export type EWhereProp<T> = {
  [K in keyof T]-?: U2I<WhereOp<T, T[K]>>
}

interface LogicOpFn<T> {
  NOT$(wheres: EWhere): EWhere<T>
  AND$(...wheres: EWhere[]): EWhere<T>
  OR$(...wheres: EWhere[]): EWhere<T>

  /** condition 为 truly 则使用后面的 where */
  AND$IF(condition: unknown, ...wheres: EWhere[]): EWhere<T>
  /** condition 为 truly 则使用后面的 where */
  OR$IF(condition: unknown, ...wheres: EWhere[]): EWhere<T>
  IF$(condition: unknown, ...wheres: EWhere[]): EWhere<T>
}

type WhereOp<TEnity, TValue>
  = IsIId<TValue> extends true ? EqOp<TEnity, TValue>
  : TValue extends string ? StrOp<TEnity, TValue>
  : TValue extends number ? CmpOp<TEnity, TValue>
  : TValue extends Date ? CmpOp<TEnity, Date | number | string & {} | "NOW">
  : TValue extends boolean ? BoolOp<TEnity>
  : TValue extends undefined | null ? NullOp<TEnity>
  : TValue extends object ? ((s: EWheresFn<Arr.Element<TValue>>) => EWhere<TEnity>)
  : never

type Op = EqOp<unknown, unknown>

type StrOp<TEnity, TValue> = {
  // like 只允许参数，或者常量
  startsWith(str: string): EWhere<TEnity>
  endsWith(str: string): EWhere<TEnity>
  contains(str: string): EWhere<TEnity>
} & CmpOp<TEnity, TValue>

type CmpOp<TEnity, TValue> = {
  gt(value: TValue | Op): EWhere<TEnity>
  lt(value: TValue | Op): EWhere<TEnity>
  gte(value: TValue | Op): EWhere<TEnity>
  lte(value: TValue | Op): EWhere<TEnity>
  between(start: TValue | Op, end: TValue | Op): EWhere<TEnity>
  notBetween(start: TValue | Op, end: TValue | Op): EWhere<TEnity>
} & EqOp<TEnity, TValue>

interface EqOp<TEnity, TValue> {
  eq(value: TValue | Op): EWhere<TEnity>
  nEq(value: TValue | Op): EWhere<TEnity>
  in(...value: (TValue | Op)[]): EWhere<TEnity>
  notIn(...value: (TValue | Op)[]): EWhere<TEnity>
}

interface BoolOp<TEnity> {
  eq: BoolEqOp<TEnity>
  nEq: BoolEqOp<TEnity>
  isTrue(): EWhere<TEnity>
  isFalse(): EWhere<TEnity>
}

interface BoolEqOp<TEnity> extends Op1<TEnity, number | undefined> {
  // 如果其他数据库支持就添加 value: boolean
  // eq(value: boolean | undefined | EWhere): EWhere<TEnity>
}

// type Op1<TEnity, TArgs extends string | number>
//     = { (value: TArgs | EWhere): EWhere<TEnity> }
//     & { [ConstValue in TArgs]: EWhere<TEnity> }
interface Op1<TEnity, TArgs> {
  (value: TArgs | EWhere): EWhere<TEnity>
  [constValue: string | number]: EWhere<TEnity>
}

type NullOp<TEnity> = {
  isNull(): EWhere<TEnity>
  isNotNull(): EWhere<TEnity>
}

type OpFn =
  & StrOp<unknown, string>
  & CmpOp<unknown, string | number>
  & EqOp<unknown, string | number | boolean>
  & NullOp<unknown>

export type OpKey = keyof OpFn

export type OpData = {
  [K in OpKey]: [op: K, tabField: TblNavField, ...value: OpVauleDatas<Parameters<OpFn[K]>>]
}[OpKey]

type OpVauleDatas<V>
  // = V extends [infer E] ? OpValueData<E>
  = { [K in keyof V]: OpValueData<V[K]> }

type OpValueData<V> = V extends Op ? TblNavField : V

type TblField = [table: number, field: string]
type TblNavField = [table: string[], field: string]
