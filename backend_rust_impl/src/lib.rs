#![allow(dead_code)]
#![allow(unused_variables)]
#![allow(non_camel_case_types)]
#![allow(non_upper_case_globals)]

#![feature(type_alias_impl_trait)]

mod dwhere;
mod query_data;
mod utils;
use std::ops::RangeFull;

mod std_ext;
struct Text;
struct Time;
struct Date;

struct Select<T>(Vec<T>);

fn default<T: Default>() -> T {
    T::default()
}
enum WxUser {}

enum ShowCms {
    _Expr_(Expr),
    Id,
    NameEn,
    NameCn,
    StartTime,
}
enum Expr {
    OpAdd(OpAdd),
}
// enum OpAdd {
//     col_str(ColKey, str),
//     str_str(String, String),
//     str_int(String, i64),
//     int_str(i64, String),
// }

struct OpAdd(Box<dyn OpNode>, Box<dyn OpNode>);

trait OpNode {}

struct ColKey {
    col: String,
}

impl Into<ColType> for ShowCms {
    fn into(self) -> ColType {
        use ShowCms::*;
        match self {
            NameEn | NameCn => ColType::Text,
            _ => default(),
        }
    }
}

#[derive(Default)]
enum ColType {
    #[default]
    Unspecified,
    Text,
}
impl From<RangeFull> for ColType {
    fn from(value: RangeFull) -> Self {
        Self::Unspecified
    }
}

pub fn select1() {
    use ShowCms::*;
    let s1 = vec![Id, NameEn];
}
pub fn add(left: usize, right: usize) -> usize {
    left + right
}

#[cfg(test)]
mod tests {
    use crate::query_data::QueryData;

    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
