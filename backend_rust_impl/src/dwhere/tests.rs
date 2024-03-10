use super::{DWhere, RightVal};

#[test]
fn right_val() {
    let vals = &[
        (r#"[0, "name"]"#, "t0.name"),
        (r#"{"param": 0}"#, ":p0"),
        ("null", "NULL"),
        ("1111", "1111"),
        ("1.11", "1.11"),
        ("true", "true"),
        // json 会把 \ 转义 \\，反序列化 \\ 转成 \
        (r#""ss\\'s""#, r#"'ss\\\'s'"#),
        (r#"[1, 2, null, [0, "id"]]"#, "(1, 2, NULL, t0.id)"),
    ];
    vals.iter().for_each(|(json, sql)| {
        let val: RightVal = serde_json::from_str(json).unwrap();
        assert_eq!(*sql, val.to_string());
    });
}

#[test]
fn right_val_list() {
    let vals = &[
        (r#"[]"#, "()"),
        (r#"[1]"#, "(1)"),
        (r#"["1"]"#, "('1')"),
        (r#"[1, 2]"#, "(1, 2)"),
        (r#"["aas", "bb"]"#, "('aas', 'bb')"),
    ];
    vals.iter().for_each(|(json, sql)| {
        let val: RightVal = serde_json::from_str(json).unwrap();
        assert_eq!(*sql, val.to_string());
    });
}

#[test]
fn dwhere() {
    #[rustfmt::skip]
    let ops = &[
        (r#"["NOT", ["eq", [0, "name"], "aaa"]]"#, "(NOT (t0.name = 'aaa'))"),
        (r#"["AND", [["eq", [0, "id"], 1], ["lt", [0, "id"], 10], ["nEq", [0, "id"], 3]]]"#,
            "(t0.id = 1 AND t0.id < 10 AND t0.id <> 3)" ),
        (r#"["OR",  [["eq", [0, "id"], 1], ["lt", [0, "id"], 10], ["nEq", [0, "id"], 3]]]"#,
            "(t0.id = 1 OR t0.id < 10 OR t0.id <> 3)" ),
        // Unary
        (r#"["isNull", [0, "name"]]"#,                  "t0.name IS NULL"),
        (r#"["isNotNull", [0, "name"]]"#,               "t0.name IS NOT NULL"),
        // Binary
        (r#"["eq",  [0, "id"], 1]"#,                    "t0.id = 1"),
        (r#"["nEq", [0, "id"], 1]"#,                    "t0.id <> 1"),
        (r#"["lt",  [0, "id"], 1]"#,                    "t0.id < 1"),
        (r#"["gt",  [0, "id"], 1]"#,                    "t0.id > 1"),
        (r#"["lte", [0, "id"], 1]"#,                    "t0.id <= 1"),
        (r#"["gte", [0, "id"], 1]"#,                    "t0.id >= 1"),
        (r#"["in",  [0, "id"], [1, 2, 3]]"#,            "t0.id IN (1, 2, 3)"),
        (r#"["notIn", [0, "id"], ["1", "2"]]"#,         "t0.id NOT IN ('1', '2')"),
        // LIKE

        // Between
        (r#"["between", [0, "id"], 1, 10]"#,            "t0.id BETWEEN 1 AND 10"),
        (r#"["notBetween", [0, "id"], 1, 10]"#,         "t0.id NOT BETWEEN 1 AND 10"),
    ];
    ops.iter().for_each(|(json, sql)| {
        let val: DWhere = serde_json::from_str(json).unwrap();
        assert_eq!(*sql, val.to_string());
    });
}

#[test]
fn where_logic_empty() {
    let ops = &[r#"["AND", []]"#, r#"["OR", []]"#];
    ops.iter().for_each(|json| {
        let val: DWhere = serde_json::from_str(json).unwrap();
        assert_eq!("()", val.to_string());
    });
}

#[test]
fn where_logic_single() {
    #[rustfmt::skip]
    let ops = &[r#"["AND", [["eq", [0, "id"], 100]]]"#,
                r#"["OR",  [["eq", [0, "id"], 100]]]"#];

    ops.iter().for_each(|json| {
        let val: DWhere = serde_json::from_str(json).unwrap();
        assert_eq!("(t0.id = 100)", val.to_string());
    });
}

// #[test]
// fn in_op() {
//     let json = r#"["in", [0, "name"], [1, 2, 3]]"#;
//     let op: DWhere = serde_json::from_str(json).unwrap();
//     assert_eq!("t0.name IN (1, 2, 3)", op.to_string());
// }

// #[test]
// fn not_in_op() {
//     let json = r#"["nIn", [0, "name"], [1, 2, "3"]]"#;
//     let op: DWhere = serde_json::from_str(json).unwrap();
//     assert_eq!("t0.name NOT IN (1, 2, '3')", op.to_string());
// }

#[derive(serde::Deserialize, Debug)]
// struct TblTypeS();
enum TblType {
    VideoInfo(#[serde(skip)] VideoInfo),
    VideoInfo2(#[serde(skip)] VideoInfo),
}
impl TblType {
    fn include_info(&self) {}
}

#[derive(serde::Deserialize, Debug)]
enum Tbl {
    VideoInfo,
}

#[derive(Default, Debug)]
struct VideoInfo;

#[derive(serde::Deserialize, Debug)]
struct Tags(String);
struct Tags2(u32);

trait VideoInclude {}
impl VideoInclude for Tags {}
impl VideoInclude for Tags2 {}

#[test]
fn ser_1() {
    // let op: Tbl = serde_json::from_str(json).unwrap();
    // println!("{:?}", op);
}

#[test]
fn deser_string() {
    let json = r#""VideoInfo""#;
    let op: Tbl = serde_json::from_str(json).unwrap();
    println!("{:?}", op);
}

// --------------
#[typetag::serde]
trait WebEvent {
    fn inspect(&self);
}

#[derive(serde::Deserialize, serde::Serialize)]
struct PageLoad;

#[typetag::serde]
impl WebEvent for PageLoad {
    fn inspect(&self) {
        println!("200 milliseconds or bust");
    }
}

#[derive(serde::Deserialize, serde::Serialize)]
struct Click;

#[typetag::serde]
impl WebEvent for Click {
    fn inspect(&self) {
        println!("WebEvent for Click: ");
    }
}

#[test]
fn test_tag_deser() {
    let json = r#"{ "Click": null }"#;
    let event: &dyn WebEvent = &PageLoad;
    println!("{}", serde_json::to_string(event).unwrap());
    let event: &Box<dyn WebEvent> = &serde_json::from_str(json).unwrap();
    println!("{}", serde_json::to_string(event).unwrap());
}
