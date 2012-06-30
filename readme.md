
##Read me

Web-based Visual Query Designer is a fork of my Academic project for B.Sc IT. 
This tool is ready to be used for generating simple SELECT queries for MySQL.

Please let me know if you find it useful.

*Swapnil Joshi* 
swapnil [dot] gnu [at] gmail.com 

Project homepage: [ http://sourceforge.net/projects/web-vqd/ ](http://sourceforge.net/projects/web-vqd/) 

##Installation

Extract all the files to the www folder of your web server.
Open `conn.php` file and set the `$username` and `$password` for your MySQL database.

##Issues

* Multi-table query generation is still buggy.  
  A join can be made between 2 tables only on one set of condition

   e.g. `SELECT tbl1.* FROM tbl1 INNER JOIN tbl2 ON tbl1.fieldA = tbl2.fieldA`

##License
Web-based Visual Query Designer is an open source software released under the [MIT License](http://opensource.org/licenses/mit-license.php).
