# Web-based Visual Query Designer

Web-based Visual Query Designer (Web-VQD) is a tool for visually generating SQL queries. The creating joins by drag-n-drop is the key highlight.
Currently, it is designed only for MySQL .

Think of it as a supplement to your MySQL front-end tool (like [
phpMyAdmin ](http://www.phpmyadmin.net/) ).


# <a target="_blank" href="http://swapnilmj.github.io/web-vqd/">Demo</a>
(Demo is hosted as a static site. APIs are hardcoded to return static JSON data.)


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
swapnil [dot] gnu+webvqd [at] mailbox.org

Swapnil Joshi
