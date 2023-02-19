# Web-based Visual Query Designer

[![GitHub mirror](https://img.shields.io/badge/mirror-GitHub-black.svg?logo=github)](https://github.com/swapnilmj/web-vqd) [![Codeberg mirror](https://img.shields.io/badge/mirror-Codeberg-blue.svg?logo=codeberg)](https://codeberg.org/swapnilmj/web-vqd)

Web-based Visual Query Designer is a tool for visually generating SELECT SQL queries.
Currently, it is designed only for MySQL .

Feel free to try this tool for generating simple SELECT queries for the MySQL
database.

Think of it as a supplement to your MySQL front-end tool (like [
phpMyAdmin ](http://www.phpmyadmin.net/) ).

<a target="_blank" href="http://swapnilmj.github.io/web-vqd/">Online demo</a>
(adapted for a static website)

## Screenshots

##### Design queries *visually*
![Example](https://cloud.githubusercontent.com/assets/2190589/7006635/5b72b1c2-dca0-11e4-84db-cf1e3834a397.png)

##### Drag-n-drop
![Drag-n-drop](https://cloud.githubusercontent.com/assets/2190589/7006820/b4916176-dca1-11e4-8ad4-0a472f179cd3.png)

## Screencast
[Youtube](https://youtu.be/vezEzwSiIjc) / [Invidious](https://yewtu.be/watch?v=vezEzwSiIjc)

## Dependencies
 - apache2
 - mysql server
 - php7
 - php mysqli extension

## Installation

Extract all the files to the `www` folder of your web server. Open `conn.php`
file and set the `$username` and `$password` for your MySQL database. 
This user (configured in conn.php) needs to have atleast `READ` access to `information_schema`.

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

