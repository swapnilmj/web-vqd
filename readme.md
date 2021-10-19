# Web-based Visual Query Designer

Web-based Visual Query Designer is a tool for visually generating SQL queries.
Currently, it is designed only for MySQL .

Feel free to try this tool for generating simple SELECT queries for the MySQL
database.

Think of it as a supplement to your MySQL front-end tool (like [
phpMyAdmin ](http://www.phpmyadmin.net/) ).

Why not try the <a target="_blank" href="http://swapnilmj.github.io/web-vqd/">online demo</a> ?

Sourceforge.net project link (mirror): [ http://sourceforge.net/projects/web-vqd/
](http://sourceforge.net/projects/web-vqd/)

## Screenshots

##### Design queries *visually*
![Example](https://cloud.githubusercontent.com/assets/2190589/7006635/5b72b1c2-dca0-11e4-84db-cf1e3834a397.png)

##### Drag-n-drop
![Drag-n-drop](https://cloud.githubusercontent.com/assets/2190589/7006820/b4916176-dca1-11e4-8ad4-0a472f179cd3.png)

## Installation

Extract all the files to the `www` folder of your web server. Open `conn.php`
file and set the `$username` and `$password` for your MySQL database.

## Limitations (as of now)

  * A join can be made between 2 tables only on one set of condition 
  
  * Aggregate queries and sub-queries are not yet supported

## License

Web-based Visual Query Designer is an open source software released under the
[MIT License](http://opensource.org/licenses/mit-license.php).

## Feedback
Please let me know if you find it useful.

Swapnil Joshi

swapnil [dot] gnu [at] gmail.com

