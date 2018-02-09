grammar select;

// Complex tokens

select: num table filters order_by fields;

count: '#' table filters;

num: (NUMBERS '*')?;

table: ID;

filters: filtersFrag?;
filtersFrag: '(' filter (',' filter)* ')';
filter: filterFrag ('|' filterFrag)*;
filterFrag:
           filtersFrag
          | variable OP variable
          | variable OP? '[' num_or_strings ']';

variable: num_or_string | ID;
order_by: ('{' ID (',' ID)* '}')?;
fields: ('[' (ID (',' ID)*)? ']')?;

num_or_strings: num_or_string (',' num_or_string)*;

num_or_string: TEXT | NUMBERS;

// Terminal tokens

OP: '>' | '<' | '<=' | '>=' | '=' | '!=' | '!';

ID: [a-zA-Z_][a-zA-Z_0-9]+;

// Allow decimal
NUMBERS: [0-9]+ | [0-9]* '.' [0-9]+;

TEXT:
      '"' (~('\r' | '\n' | '\\' | '"') | '\\' ('"' | '\\'))* '"'
    | '\'' (~('\r' | '\n' | '\'') | '\\' ('\'' | '\\'))* '\'';

// skip spaces, tabs, newlines
WS: [ \t\r\n]+ -> skip;
