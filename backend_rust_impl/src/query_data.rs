use crate::dwhere::DWhere;
use parse_display::Display;
use serde::Deserialize;
use std::fmt::{self};
mod tests;

#[derive(Deserialize, Display)]
#[display("t{0}.{1}")]
pub(crate) struct TblField(u8, String);
impl TblField {
    #[rustfmt::skip]
    fn check_injuect(&self) -> bool {
        self.1.find(|c: char| {
            if c.is_whitespace() { return true; }
            match c {
                '\\' | '\'' | '"' | '-' | '/' => true,
                _ => false,
            }
        })
        .is_none()
    }
}

#[rustfmt::skip]
fn check_injuect(s: &String) -> bool {
    s.find(|c: char| {
        if c.is_whitespace() { return true; }
        match c {
            '\\' | '\'' | '"' | '-' | '/' => true,
            _ => false,
        }
    }).is_none()
}

pub struct QueryReq<T> {
    query: String,
    // from: T::FromTbl
    param: Vec<Param<T>>,
}

#[derive(Deserialize)]
#[serde(untagged)]
pub enum Param<T> {
    Int(i32),
    Float(f64),
    Bool(bool),
    Str(String),
    List(Vec<Param<T>>),

    Ctx { ctx: T },
    TblField(TblField),
}

#[derive(Deserialize)]
pub struct QueryData {
    pub from: String,
    // pub include: Vec<String>,
    pub r#where: Option<DWhere>,
    pub select: Vec<DSelect2>,
    #[serde(default)]
    pub orderby: Vec<DOrderBy>,
    #[serde(default)]
    pub groupby: Vec<TblField>,
}

#[derive(Deserialize)]
pub struct DSelect2 {
    i: u8,
    #[serde(default)]
    columns: Vec<String>,
    #[serde(default)]
    with: Vec<(String, DSelect2)>,
}

#[derive(Deserialize)]
pub struct DOrderBy(TblField, OrderType);

#[derive(Default, Deserialize)]
enum OrderType {
    #[default]
    ASC,
    DESC,
}

#[derive(Deserialize)]
pub struct QueryData2<T: FromTbl> {
    pub from: T,
    /**
     *   ts: user => [user.post.comment, user.info]
     * json: [["post", "comment"], "info"] */
    pub include: IncludeString,
    pub r#where: Option<DWhere>,
    pub select: Vec<TblField>,
}

#[derive(Deserialize)]
pub enum IncludeString {
    Str(String),
    Vec(Vec<IncludeString>),
}

#[derive(Deserialize)]
pub(super) enum IncludeNode<T: IncludeInfo> {
    T1(T),
    T2(T, T),
}

// pub enum DInclude<T: TblQuery> {
//     T1(T::Include),
//     T2(T::Include, <T::Include as TblQuery>::Include),
// }

pub trait FromTbl {
    type Include: IncludeInfo + for<'de> Deserialize<'de>; //= Box<dyn IncludeInfo + for<'de> Deserialize<'de>>;
}
pub trait IncludeInfo {
    fn relation(&self, i_self: u8, i_join: u8) -> String;
}

pub trait TblQuery {
    const Tbl: &'static str;
    // const Include:
    type Include: for<'de> Deserialize<'de>;
}

#[derive(Deserialize)]
pub struct VideoInfo {}

#[derive(Deserialize)]
pub struct Tags {}

#[derive(Deserialize, Display)]
pub enum VideoInfo_Include {
    #[display("")]
    Tags(Tags),
}

impl TblQuery for VideoInfo {
    const Tbl: &'static str = "VP_VideoInfos";

    type Include = VideoInfo_Include;
}

struct Duration {
    secs: u64,
    nanos: u32,
}

use serde::de::{self, Deserializer, MapAccess, SeqAccess, Visitor};

impl<'de> Deserialize<'de> for Duration {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        enum Field {
            Secs,
            Nanos,
        }

        // This part could also be generated independently by:
        //
        //    #[derive(Deserialize)]
        //    #[serde(field_identifier, rename_all = "lowercase")]
        //    enum Field { Secs, Nanos }
        impl<'de> Deserialize<'de> for Field {
            fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Field, D::Error> {
                struct FieldVisitor;

                impl<'de> Visitor<'de> for FieldVisitor {
                    type Value = Field;

                    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                        formatter.write_str("`secs` or `nanos`")
                    }

                    fn visit_str<E: de::Error>(self, value: &str) -> Result<Field, E> {
                        match value {
                            "secs" => Ok(Field::Secs),
                            "nanos" => Ok(Field::Nanos),
                            _ => Err(de::Error::custom("ds")),
                        }
                    }
                }

                deserializer.deserialize_identifier(FieldVisitor)
            }
        }

        struct DurationVisitor;

        impl<'de> Visitor<'de> for DurationVisitor {
            type Value = Duration;

            fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                formatter.write_str("struct Duration")
            }

            fn visit_seq<V: SeqAccess<'de>>(self, mut seq: V) -> Result<Duration, V::Error> {
                let secs =
                    seq.next_element()?.ok_or_else(|| de::Error::invalid_length(0, &self))?;
                let nanos =
                    seq.next_element()?.ok_or_else(|| de::Error::invalid_length(1, &self))?;
                Ok(Duration { secs, nanos })
            }

            fn visit_map<V: MapAccess<'de>>(self, mut map: V) -> Result<Duration, V::Error> {
                let (mut secs, mut nanos) = (None, None);
                // map.next_value_seed(seed)
                while let Some(key) = map.next_key()? {
                    match key {
                        "secs" => secs = Some(map.next_value()?),
                        "nanos" => nanos = Some(map.next_value()?),
                        _ => return Err(de::Error::unknown_field(key, FIELDS)),
                    }
                }
                let secs = secs.ok_or_else(|| de::Error::missing_field("secs"))?;
                let nanos = nanos.ok_or_else(|| de::Error::missing_field("nanos"))?;
                Ok(Duration { secs, nanos })
            }
        }

        const FIELDS: &'static [&'static str] = &["secs", "nanos"];
        deserializer.deserialize_string(DurationVisitor)
    }
}


