use parse_display::FromStr;
use std::{fmt::Debug, ops::Not};

use super::{FromTbl, IncludeInfo};

// type StrFields = Vec<DTblSelect<String>>;
// pub enum DTbl {
//     User(Vec<DTblSelect<UserField>>),
//     Post(Vec<DTblSelect<PostField>>),
//     Tag(StrFields),
// }

type JoinStr = String;
// enum With {
//     Tbl(Tbl, JoinStr),
//     With(Vec<With>),
// }
struct With(TblSelect, JoinStr, Vec<With>);
impl With {}

pub enum DSelectFW {
    Column(String),
    With(DSelect),
}

pub struct DSelect(u8, String, Vec<DSelectFW>);

impl DSelect {
    // fn parse(self, i: u8) -> TblSelect {
    //     let mut tbl = TblSelect { tbl: self.0, i, columns: vec![], with: vec![] };
    //
    //     let mut i = 0; // 下一层再从1开始
    //     self.1.into_iter().for_each(|d| match d {
    //         DSelectFW::Column(col) => tbl.columns.push(col),
    //         DSelectFW::With(with) => tbl.with.push(with.parse((i += 1, i).1)),
    //     });
    //
    //     return tbl;
    // }
}

struct TblSelect {
    tbl: Tbl,
    i: u8,
    columns: Vec<String>,
    with: Vec<TblSelect>,
}
impl TblSelect {
    fn check(&self) -> Option<TblErr> {
        // todo 检查注入
        if let Some(field) = self.columns.iter().find(|field| self.tbl.non_select(field)) {
            return Some(TblErr::Unselectable(field.clone()));
        }
        if self.i >= 10 {
            return Some(TblErr::WithExcessive(self.tbl));
        }
        return None;
    }
}

pub enum UserField {
    id,
    name,
}

pub enum PostField {
    id,
    titel,
}

//
#[derive(Deserialize, Clone, Copy, PartialEq, FromStr)]
#[display("{0}")]
enum Tbl {
    User(#[serde(skip)] User),
    Post(#[serde(skip)] Post),
    Comment(#[serde(skip)] Comment),
    Tag(#[serde(skip)] Tag),
    Badge(#[serde(skip)] Badge),
}
impl Tbl {
    // fn t(self) -> Box<dyn TblConfig> {
    //     use Tbl::*;
    //     match self {
    //         User(v) => Box::new(v),
    //         Post(v) => Box::new(v),
    //         Comment(v) => Box::new(v),
    //         Tag(v) => Box::new(v),
    //         Badge(v) => Box::new(v),
    //     }
    // }
    fn map<U, F: Fn(&dyn TblConfig) -> U>(self, f: F) -> U {
        use Tbl::*;
        match self {
            User(v) => f(&v),
            Post(v) => f(&v),
            Comment(v) => f(&v),
            Tag(v) => f(&v),
            Badge(v) => f(&v),
        }
    }
    fn non_select(self, field: &String) -> bool {
        self.map(|t| t.can_select(field).not())
    }
}

// impl Deref for Tbl {
//     type Target = Box<dyn TblConfig>;

//     fn deref(&self) -> &Self::Target {
//         use Tbl::*;
//         match self {
//             User(v) => Box::new(v),
//             Post(v) => Box::new(v),
//             Comment(v) => Box::new(v),
//             Tag(v) => Box::new(v),
//             Badge(v) => Box::new(v),
//         }
//     }
// }

enum WithJoin {
    One(String),
    Many(String),
}

trait TblJoin: Copy {
    fn join_str(&self, join_tbl: Tbl) -> String;
}

enum TblErr {
    Unselectable(String),
    NotWith(Tbl),
    WithExcessive(Tbl),
    MissingId(Tbl),
    IllegalString,
}
trait TblConfig {
    // trait object 需要这样的签名，不能用const 声明，必须有 self
    fn id(&self) -> &'static str {
        ""
    }
    fn with_tbl(&self, i: u8, join_tbl: Tbl, j: u8) -> Result<WithJoin, TblErr> {
        Err(TblErr::NotWith(join_tbl))
    }
    /// 默认实现都可选
    fn can_select(&self, field: &String) -> bool {
        // 可能还要加上下文作为参数传进来
        true
    }
}

// #[rustfmt::skip]
// mod tbl {

#[derive(Default, Debug, FromStr, Clone, Copy, PartialEq)]
#[display("{:?}")]
pub struct User;
// pub enum User { #[default] User }

impl TblJoin for User {
    fn join_str(&self, join_tbl: Tbl /*, with_chain: &Vec<With> */) -> String {
        // let first_is_user0 = || with_chain.first().is_some_and(|w| w.0.tbl == Tbl::User(User));
        // // 其他关联表不可以查到私有数据
        // let first_is_user = || {
        //     if let [With(TblSelect { tbl: Tbl::User(_), .. }, ..)] = with_chain[..1] {
        //         true
        //     } else {
        //         false
        //     }
        // };
        match join_tbl {
            Tbl::Comment(_) => "LEFT JOIN `comment` as c1 ON".to_string(),
            // 多对多关联查询
            Tbl::Tag(_) => format!(
                "LEFT JOIN `user_tag` as ut ON ut.user_id = {} \n\
                 LEFT JOIN `tag` as t1 ON t1.id = ut.tag_id",
                "p0"
            ),
            // 徽章是可以公开的
            Tbl::Badge(_) => format!(
                "Left join `user_badge` as ub{1} on ub{1}.user_id = u{0}.id \n\
                 left join `badge` b{1} on b{1}.id = ub{1}.badge_id",
                0, 1
            ),
            _ => todo!(),
        }
    }
}
impl TblConfig for User {
    fn with_tbl(&self, i: u8, join_tbl: Tbl, j: u8) -> Result<WithJoin, TblErr> {
        use WithJoin::*;
        match (i, join_tbl) {
            (0, Tbl::Comment(_)) => {
                Ok(Many(format!("LEFT JOIN `comment` as c{1} ON c{1}.user_id = u{0}.id", i, j)))
            }
            // 多对多关联查询
            (0, Tbl::Tag(_)) => Ok(Many(format!(
                "LEFT JOIN `user_tag` as ut{1} ON ut.user_id = u{0}.id \n\
                 LEFT JOIN `tag` as t{1} ON t{1}.id = ut{1}.tag_id",
                i, j
            ))),
            // 徽章是可以公开的
            (_, Tbl::Badge(_)) => Ok(Many(format!(
                "LEFT JOIN `user_badge` as ub{1} on ub{1}.user_id = u{0}.id \n\
                 LEFT JOIN `badge` b{1} on b{1}.id = ub{1}.badge_id",
                i, j
            ))),
            _ => Err(TblErr::NotWith(join_tbl)),
        }
    }
    fn can_select(&self, field: &String) -> bool {
        match field.as_str() {
            "password" | "email" => false,
            _ => true,
        }
    }
}

impl FromTbl for User {
    type Include = UserInclude;
}

#[derive(Deserialize, Debug)]
pub enum UserInclude {
    Post(#[serde(skip)] Post),
}

impl IncludeInfo for UserInclude {
    fn relation(&self, i_self: u8, i_join: u8) -> String {
        // match self {
        //     Self:: Video(j) | Self::Post(j) =>
        // }
        todo!()
    }
}

#[derive(Default, Debug, FromStr, Clone, Copy, PartialEq)]
#[display("{:?}")]
pub struct Post;
impl TblConfig for Post {}
impl FromTbl for Post {
    type Include = PostInclude;
}

impl TblJoin for Post {
    fn join_str(&self, join_tbl: Tbl) -> String {
        match join_tbl {
            Tbl::Comment(_) => "LEFT JOIN `comment` as c1 ON".to_string(),
            Tbl::Tag(_) => format!(
                // 多对多关联查询
                "INNER JOIN `post_tag` as pt ON pt.post_id = {} \n\
                 LEFT JOIN `tag` as t1 ON t1.id = pt.tag_id",
                "p0"
            ),
            _ => todo!(),
        }
    }
}

#[derive(Deserialize, Debug)]
pub enum PostInclude {
    Comment(#[serde(skip)] Comment),
    Tags(#[serde(skip)] Tag),
}
impl IncludeInfo for PostInclude {
    fn relation(&self, i_self: u8, i_join: u8) -> String {
        todo!()
    }
}

#[derive(Default, Debug, FromStr, Clone, Copy, PartialEq)]
#[display("{:?}")]
pub struct Comment;
impl TblConfig for Comment {}

#[derive(Default, Debug, FromStr, Clone, Copy, PartialEq)]
#[display("{:?}")]
pub struct Tag;
impl TblConfig for Tag {}

#[derive(Default, Debug, FromStr, Clone, Copy, PartialEq)]
#[display("{:?}")]
pub struct Badge;
impl TblConfig for Badge {}

// }

// 实现序列化
struct Deser<T>(Box<T>);

trait TagDeser<T: Debug> {
    type Output;
    fn deser(str: &str) -> Self::Output;
}

// use derive_deref::Deref;
// impl TagDeser {
//
// }
use serde::{de, Deserialize, Deserializer};

// type DynFromTbl<'de2> = dyn FromTbl<Include = dyn IncludeInfo +  Deserialize<'de>>;

// impl<'de> serde::de::Deserialize<'de> for Deser<Box<dyn FromTbl>> {
//     fn deserialize<D: serde::Deserializer<'de>>(deser: D) -> Result<Self, D::Error> {
//         // struct StrVisitor;
//         // impl<'de> serde::de::Visitor<'de> for StrVisitor {
//         //     type Value = dyn FromTbl;
//         //     fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
//         //         formatter.write_str("struct Deser<T：FromTbl>")
//         //     }

//         //     fn visit_str<E: de::Error>(self, v: &str) -> Result<Self::Value, E> {
//         //         todo!()
//         //     }
//         // }
//         todo!()
//         // deser.deserialize_string(StrVisitor)
//     }
// }
