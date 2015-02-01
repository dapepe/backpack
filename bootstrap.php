<?php

/**
 * Common initialization and library loading code.
 *
 * @author Peter-Christoph Haider (Project Leader) et al.
 * @package Backpack
 * @version 1.1
 * @copyright Copyright (c) 2012-2014, Zeyon Technologies
 */

/* Initialize includes
--------------------------------------------------- */
define('BASE_DIR', dirname(__FILE__).DIRECTORY_SEPARATOR);

if (defined('LIBDIR')) {
	define('LIB_DIR', LIBDIR.(substr(LIBDIR, -1) != DIRECTORY_SEPARATOR ? DIRECTORY_SEPARATOR : ''));
} else {
	define('LIB_DIR', BASE_DIR.'lib'.DIRECTORY_SEPARATOR);
}

set_include_path(
	get_include_path().PATH_SEPARATOR.
	LIB_DIR.PATH_SEPARATOR.
	BASE_DIR.PATH_SEPARATOR
);


/* Specify application constants
--------------------------------------------------- */
define('API_DIR',   LIB_DIR.'api'.DIRECTORY_SEPARATOR);
define('ASSET_DIR', BASE_DIR.'assets'.DIRECTORY_SEPARATOR);

/* Load the composer libraries
--------------------------------------------------- */
require 'vendor/mustangostang/spyc/Spyc.php';
require 'vendor/zeyon/rest/src/server.php';
require 'vendor/zeyon/rest/src/client.php';
require 'vendor/zeyon/rest/src/validator.php';
require 'vendor/zeyon/rest/src/localizer.php';
require 'vendor/zeyon/rest/src/mime.php';

/* Load backpack libraries
--------------------------------------------------- */
require 'backpack/localizer.class.php';
require 'backpack/api.class.php';
require 'backpack/app.class.php';

/* Initialize application constants
--------------------------------------------------- */
define('VERSION'     , '1.0');
define('API_DEFAULT' , 'user');
define('VIEW_DEFAULT', 'console');

/* Include settings
--------------------------------------------------- */
if (is_file('config.php'))
	include 'config.php';
if (!defined('INSTANCE_DIR'))
	define('INSTANCE_DIR', realpath(BASE_DIR.'instances').DIRECTORY_SEPARATOR);
if (!defined('IMAGEMAGIC_CONVERT'))
	define('IMAGEMAGIC_CONVERT', 'convert');
if (!defined('BASE_URL'))
	define('BASE_URL', './');