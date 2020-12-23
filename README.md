# µ Query Language to JSON Query Builder
Uses µ Query Language to build JSON query object for easy querying.

# What does it do?
This service generates [Q-Server](https://github.com/cnayan/q-Server) compatible JSON query objects.

# Why do we need it?
Q-Server expects quries in the form of a JSON object. That [format is documented on Q-Server](https://github.com/cnayan/q-Server/blob/master/README.md). But sometimes writing a query expression is simpler than writing a JSON object. Even better, if the query language is easy to learn and use!

You may ask: what was wrong with SQL? Nothing! Except, if you want to minimize the query writing effort in your client app, and need a consistent interface to the data, no matter who the data provider is or when the data provider is changed, you can use µ query language.

# What does it do?
You feed the service a collection of µ queries, to get the entries from a collection or table or any source that Q-Server is connected to. µ Query service will provide you a JSON query object, ready for consumption for the Q-Server.

In brief, it takes away the burden of writing complex JSON query object.

# Can I use it for production use?
I'm sure it will be helpful to your product, but until test cases are added, please don't.

# What is the format of µ Query language?
Check this:
* Query to retrieve complete table / collection from data provider is:
    * `employeeTable`
* Query to retrieve first 5 entries from table / collection from data provider is:
    * `5 * employeeTable`
* Query to retrieve first 5 entries from table / collection from data provider with specified fields is:
    * `5 * employeeTable [employee_id, employee_name]`

Easy enough?

Before you proceed further to study grammar of the language, please note that this code uses [ANTLR](http://www.antlr.org/).

There are 2 types of queries that you can build:
1. **'Select'** statements: These provide column data of the entries. The [EBNF](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form) format of the query is:
    * `select: num table filters order_by fields;`
        1. **num** [Optional]: It is optional. When missing, all records are fetched. If given, only those number of 'top' or 'limit'ed records are fetched. Expected value is a natural number.
            * `num: (NUMBERS '*')?;`: The number has to follow asterik (`*`) symbol.
        2. **table** [Required]: This represents the name of the table or ollection. Expected format is name of table/collection without space as string.
        3. **filters** [Optional]: This is a collection of expressions containing field names, numerics and strings. The collection is given in format of:
            * `filters: filtersFrag?;`: Filters are completely optional.
            * `filtersFrag: ( filter (, filter)* );`: Filter expressions, separated by `,` will be `AND`ed.
            * `filter: filterFrag ( | filterFrag)*;`: Filter expressions can be `OR`ed using `|`.
            * `filterFrag: variable OP variable | variable OP? [ num_or_strings ] | filterFrag;`: The `filterFrag` in this expression helps in writing nested filters.
        It is contained by `(` and `)`. Refer exmples below, for more clarity.
        4. **order_by** [Optional]: This is a collection of names of the fields / columns, by which you want the data to be sorted. The EBNF expression is
            * `order_by: ( { ID (, ID)* } )?;`: It is optional. You provide the names of the fields separated by comma (`,`). It is contained by `{` and `}`.
            * `ID: [a-zA-Z_] [a-zA-Z_0-9]+;`: This is what ID stands for. First letter can be a character in A-Z range (ignoring case) or an underscore (`_`). The rest of the literals can also include a digit.
        5. `fields` [Optional]: Here you provide names of fields to fetch. The EBNF format is:
            * `fields: ( [ (ID (, ID)*)? ] )?;`: It is contained by `[` and `]`.

2. **'Count'** statements: These provide a number of entries matching the given criteria. The EBNF format of the query is:
    * `count: '#' table filters;`
        1. **#** [Required]: This hash/sharp symbol (`#`) must be provided to make this query return you a count, instead of entries.
        2. **table** [Required]: Same as explained in `select`.
        3. **filters** [Optional]: Same as explained in `select`.
        
Refer [select.g4](antlr/select.g4) for complete reference.

`null` represents a NULL value, and is a recognized keyword.


Some examples:

```javascript
    // ============================= SELECT EXAMPLES ================================
    // Returns 'employee_id' and 'employee_name' from 'employeeTable', limited to first 5.
    `5 * employeeTable [employee_id, employee_name]`

    // Returns all fields from 'employeeTable' where 'employee_id' is in collection [100, 101, 102].
    `employeeTable(employee_id [2001, 2002])`

    // Returns all fields from 'employeeTable' where 'employee_id' is **not** in collection
    // [100, 101, 102].
    `employeeTable(employee_id ![100, 101, 102])`

    // Returns all fields from 'employeeTable' where 'employee_name' starts with text 'Jane',
    // limited to first entry.
    `1 * employeeTable(employee_name = "Jane*")`

    // Returns all fields from 'employeeTable' where 'employee_name' ends with text 'Doe', limited
    // to first entry.
    `1 * employeeTable(employee_name = "*Doe")`

    // Returns all fields from 'employeeTable' where 'employee_name' contains text 'Mary', limited
    // to first entry.
    `1 * employeeTable(employee_name = "*Mary*")`

    // Returns all fields from 'employeeTable' where 'employee_name' does **not** match string pattern
    // (starts with 'abc').
    `employeeTable(employee_name != "abc*")`

    // Returns all fields from 'employeeTable' where 'employee_id' is greater than 100.
    `employeeTable (employee_id > 100)`

    // Returns all fields from 'employeeTable' where 'employee_id' is greater than or equal to 100.
    `employeeTable (employee_id >= 100)`

    // Returns 'employee_id' and 'employee_name' from 'employeeTable' where 'employee_id' is greater than
    // or equal to 100, sorted by assesment_status, employee_id and employee_name, in the given order.
    `employeeTable (employee_id >= 100) {assesment_status,employee_id,employee_name}[employee_id, employee_name]`

    // Returns top 7 records, with 'employee_id', 'employee_name' and 'business_unit' fields from 'employeeTable'
    // where 'employee_id' matches pattern *816517* (contains 816517), sorted by 'employee_id'.
    // This is also an example to show than the query can be split across multiple lines.
    `7 * employeeTable (
        employee_id = '*816517*'
    ) {
        employee_id
    } [
        employee_id,
        employee_name,
        business_unit
    ]`

    // Returns all fields from 'employeeTable' where
    //  * 'business_unit' is not empty and NULL
    //  * 'employee_name' is not empty and NULL
    //  * 'joining_date' is not empty and NULL
    // sorted by 'employee_id'.
    `employeeTable
    (
        (business_unit != '', business_unit != null) | (employee_name != '', employee_name != null)
        , joining_date != ''
        , joining_date != null
    )
    {employee_id}`
    // The corresponding SQL query would be:
    //      SELECT * FROM employeeTable
    //      WHERE (
    //          business_unit <> '' AND business_unit IS NOT NULL
    //          OR
    //          employee_name <> '' AND employee_name IS NOT NULL
    //      )
    //      AND joining_date <> ''
    //      AND joining_date IS NOT NULL


    // ============================= SELECT EXAMPLES ================================

    // Returns count of entries in 'employeeTable' where 'employee_id' is greater than or equal to 100.
    `# employeeTable (employee_id >= 100)`

    // Returns count of entries in 'employeeTable' where
    //  * 'business_unit' is not empty and NULL
    //  * 'employee_name' is not empty and NULL
    //  * 'joining_date' is not empty and NULL
    // sorted by 'employee_id'.
    `# employeeTable
    (
        (business_unit != '', business_unit != null) | (employee_name != '', employee_name != null)
        , joining_date != ''
        , joining_date != null
    )`
    // The corresponding T-SQL query would be:
    //      SELECT TOP 1 COUNT(1) FROM employeeTable
    //      WHERE (
    //          business_unit <> '' AND business_unit IS NOT NULL
    //          OR
    //          employee_name <> '' AND employee_name IS NOT NULL
    //      )
    //      AND joining_date <> ''
    //      AND joining_date IS NOT NULL

```

Essentially, it boils down to this format structure:
* Select : *+ve NUMBER* **"collection or table"** *( filters )* *{ order by }* *[ fields ]*
* Count : *#* **"collection or table"** *( filters )*


Here is a sample input and output received:
```javascript
{
    config: {
        "server": "localhost",
        "options": {
            // "instanceName": "SQLEXPRESS",
            "trustedConnection": true,
            "encrypt": false
        }
    },

    db: 'ABCD',

    select: [
        '2 # employeeTable',
        'employeeTable (employee_id > 1000)'
    ],

    count: [
        `# employeeTable
        (
            (business_unit != '', business_unit != null) | (employee_name != '', employee_name != null)
            , joining_date != ''
            , joining_date != null
        )`
    ]
};
```

then, this is how result looks like:
```json
{
  "config": {
    "server": "localhost",
    "options": {
      "trustedConnection": true,
      "encrypt": false
    }
  },
  "db": "ABCD",
  "select": [
    {
      "employeeTable": {
        "limit": 2
      }
    },
    {
      "employeeTable": {
        "filter": [
          {
            "employee_id": {
              "gt": 1000
            }
          }
        ]
      }
    }
  ],
  "count": [
    {
      "employeeTable": {
        "filter": [
          {
            "all": [
              {
                "or": [
                  {
                    "all": [
                      {
                        "business_unit": {
                          "not_eq": "\"\""
                        }
                      },
                      {
                        "business_unit": {
                          "not_eq": "null"
                        }
                      }
                    ]
                  },
                  {
                    "all": [
                      {
                        "employee_name": {
                          "not_eq": "\"\""
                        }
                      },
                      {
                        "employee_name": {
                          "not_eq": "null"
                        }
                      }
                    ]
                  }
                ]
              },
              {
                "joining_date": {
                  "not_eq": "\"\""
                }
              },
              {
                "joining_date": {
                  "not_eq": "null"
                }
              }
            ]
          }
        ]
      }
    }
  ]
}
```

# Filter Operators
The supported operators are:

Operator  | Description
------------- | -------------
**=** | Equality check. Also, if the RHS (right hand side) includes `*` in the text can be used for pattern matching.
**!=** | Inequality check. Also, if the RHS (right hand side) includes `*` in the text can be used for a negated pattern matching.
**[value1, value2, ..values..]** | This expression provides collection of possible values to find in. The collection is contained by `[` and `]`.
**! [value1, value2, ..values..]** | Just like collection check, but negated (i.e. excluding the collection values).
**>** | Greater than, for numbers.
**>=** |  Greater than or equal to, for numbers.
**<** | Less than, for numbers.
**<=** |  Less than or euqal to, for numbers.

# Returned Data Format
The returned object format is already explained by documentation of Q-Server.

# How to build
> The Pre-requsites are:
> * Download [Antlr 4](http://www.antlr.org/download.html) (complete, jar). Keep it in `antlr` folder.
> * Make sure the environment is configured to run Antlr jar file (like, JRE 8+ is installed, and environment variables set, if needed.)

1. Run antlr to generate the lexer and parser files, from command prompt:
    * `cd antlr && java -jar antlr-4.7-complete.jar -Dlanguage=JavaScript select.g4 && cd..`: This is required very first time, or whenever you modify the select.g4 file. A script has already been added to the package.json. To use it, run `npm run gen`.
2. Run `npm start`.

# Caveats
There are a few, which correspond to the ones in Q-Server. They are:
1. Only select and count can be queried. No other supported yet.
2. Except the above documented operators and expressions, others are not supported yet.
