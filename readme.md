Web-based Visual Query Designer is a tool for visually generating SQL queries.
Currently, it is designed only for MySQL .

Feel free to try this tool for generating simple SELECT queries for the MySQL
database.

Think of it as a supplementary tool to your MySQL front-end tool (like [
phpMyAdmin ](http://www.phpmyadmin.net/) ).

Please let me know if you find it useful.

Swapnil Joshi

swapnil [dot] gnu [at] gmail.com

Sourceforge.net Project page: [ http://sourceforge.net/projects/web-vqd/
](http://sourceforge.net/projects/web-vqd/)

## Installation

Extract all the files to the `www` folder of your web server. Open `conn.php`
file and set the `$username` and `$password` for your MySQL database.

## Issues

  * Multi-table query generation is still buggy.   

  * A join can be made between 2 tables only on one set of condition 

e.g. `SELECT tbl1.* FROM tbl1 INNER JOIN tbl2 ON tbl1.fieldA = tbl2.fieldA
`

## License

Web-based Visual Query Designer is an open source software released under the
[MIT License](http://opensource.org/licenses/mit-license.php).


