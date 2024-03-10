#![allow(private_interfaces)]
use crate::{query_data::TblField, utils::slice_join_bracket};
use derive_deref::Deref;
use parse_display::Display;
use serde::Deserialize;
#[cfg(test)]
mod tests;

#[derive(Deserialize, Display)]
#[display("{0}")]
#[serde(untagged)]
pub enum RightVal {
    Tbl(TblField),
    #[display(":p{param}")] #[rustfmt::skip]
    Param { param: u8 },
    Null(Null),
    ConstInt(i32),
    ConstFloat(f32),
    ConstBool(bool),
    ConstStr(ConstStr),
    ConstList(ConstList),
}

#[derive(Display, Default, Deserialize)]
#[display("NULL")]
struct Null;

#[derive(Deserialize)]
struct ConstStr(String);
impl std::fmt::Display for ConstStr {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "'{}'", self.0.replace('\\', "\\\\").replace('\'', "\\'"))
    }
}

#[derive(Deserialize, Deref)]
struct ConstList(Vec<RightVal>);
impl std::fmt::Display for ConstList {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        slice_join_bracket(f, self, ", ")
    }
}

// #[derive(Deserialize)]
// pub enum DWhere {
//     OR(Vec<DWhere>),
//     AND(Vec<DWhere>),
//     NOT(Box<DWhere>),
//
//     Eq(BinaryNode),
//     In(TblField, Vec<RightVal>),
//     IsNull(TblField),
//     Between(TblField, RightVal, RightVal),
//
//     NotEq(BinaryNode),
//     NotIn(TblField, Vec<RightVal>),
//     IsNotNull(TblField),
//     NotBetween(TblField, RightVal, RightVal),
// }
use where_op::*;

#[derive(Deserialize, Display)]
#[serde(untagged)]
pub enum DWhere {
    #[display("(NOT ({1}))")]
    NOT(NotOp, Box<DWhere>),
    #[display("{0}")]
    Logic(DLogic),
    #[display("{1} {0}")]
    Unary(UnaryOp, TblField),
    #[display("{1} {0} {2}")]
    Binary(BinaryOp, TblField, RightVal),
    #[display("{1} {0} {2} AND {3}")]
    Between(BetweenOp, TblField, RightVal, RightVal),
    // Ternary(TernaryOp, TblField, RightVal, RightVal),
}

#[derive(Deserialize)]
struct DLogic(LogicOp, Vec<DWhere>);
impl std::fmt::Display for DLogic {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        slice_join_bracket(f, &self.1, &format_args!(" {} ", self.0))
    }
}

// impl std::fmt::Display for DWhere {
//     fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
//         use DWhere::*;
//         // let x : std::fmt::Arguments
//         match self {
//             NOT(_, w) => write!(f, "(NOT ({}))", w),
//             Logic(op, v) => slice_join_bracket(f, v, &format_args!(" {} ", op)),
//             Unary(op, field) => write!(f, "{} {}", field, op),
//             Binary(op, field, val) => write!(f, "{} {} {}", field, op, val),
//             Between(op, field, start, end) => write!(f, "{} {} {} AND {}", field, op, start, end),
//         }
//     }
// }

// #[derive(Deserialize)]
// struct LogicNode(LogicOp, Vec<DWhere>);

#[rustfmt::skip]
mod where_op {
use parse_display::Display;
use serde::Deserialize;

#[derive(Deserialize)]
pub enum NotOp { NOT, }

#[derive(Deserialize, Display)]
pub enum LogicOp { AND, OR, }

// #[derive(Deserialize)]
// pub enum InOp { r#in, nIn, }

#[derive(Deserialize, Display)]
pub enum UnaryOp {
    #[display("IS NULL")]       isNull,
    #[display("IS NOT NULL")]   isNotNull,
}

#[derive(Deserialize, Display)]
pub enum BinaryOp {
    #[display("=")]             eq,
    #[display("<>")]            nEq,
    #[display("IN")]            r#in,
    #[display("NOT IN")]        notIn,
    #[display("<")]             lt,
    #[display(">")]             gt,
    #[display("<=")]            lte,
    #[display(">=")]            gte,
    // 这三个 like 不区分了，只用 like，
    // #[display("LIKE")]          like,
    #[display("LIKE")]          startsWith,
    #[display("LIKE")]          endsWith,
    #[display("LIKE")]          contains,
}

#[derive(Deserialize, Display)]
pub enum BetweenOp {
    #[display("BETWEEN")]       between,
    #[display("NOT BETWEEN")]   notBetween,
}

}
