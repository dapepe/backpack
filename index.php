<?php

/**
 * Application Index
 *
 * @author Peter-Christoph Haider (Project Leader) et al.
 * @package Backpack
 * @version 1.1
 * @copyright Copyright (c) 2012-2014, Zeyon Technologies
 */

// Load main libraries and constants
require_once(dirname(__FILE__).DIRECTORY_SEPARATOR.'bootstrap.php');

/* Session management
--------------------------------------------------- */
session_name('backpack');

// Work-around for setting up a session while uploading with Flash Player.
// Because flash doesn't send the cookies
if (isset($_POST["PHPSESSID"]))
	session_id($_POST["PHPSESSID"]);

session_start();

/* Initialize localization
--------------------------------------------------- */
$locale = Localizer::getInstance(['en'], 'en');
$locale->load(ASSET_DIR.'locales', false);  // Load locales - no caching

try {
	if (
		isset($_REQUEST['do'])
		|| (isset($_SERVER['PATH_INFO']) && preg_match('/^\/(api|grid)\/([a-z0-9_]+)\/([a-z0-9_.-]+)(\/([a-z0-9_.-]+))?\/?/iu', $_SERVER['PATH_INFO'], $match))
	) {

		/* PERFORM THE API CALL
		-------------------------------------------------------------------- */

		if (isset($match)) {
			array_shift($match);
			switch (array_shift($match)) {
				case 'grid':
					if (sizeof($match) == 5) {
						$_REQUEST['index'] = array_pop($match);
						array_pop($match);
					}
					$_REQUEST['do']     = 'download_file';
					$_REQUEST['api']    = 'gridfs';
					$_REQUEST['bucket'] = array_shift($match);
					$_REQUEST['index']  = array_shift($match);
					break;
				default:
					if (sizeof($match) == 5) {
						$_REQUEST['index'] = array_pop($match);
						array_pop($match);
					}
					$_REQUEST['do']  = array_pop($match);
					$_REQUEST['api'] = array_pop($match);
					break;
			}
		}

		try {
			$apiName = array_key_exists('api', $_REQUEST) ? strtolower($_REQUEST['api']) : API_DEFAULT;

			$api = \Backpack\APIFactory::get($apiName);
			$api->run();
		} catch (Exception $e) {
			header('Content-Type: application/json; charset=utf-8');
			$res = array('error' => $e->getMessage());
			// if ( isset($_REQUEST['debug']) )
				$res['trace'] = $e->getTrace();
			echo json_encode($res);
		}

	} elseif (
		isset($_REQUEST['_lang'])
		|| (isset($_SERVER['PATH_INFO']) && preg_match('/lang\/([a-z]{2}_[A-Z]{2})\.(js|json)$/u', $_SERVER['PATH_INFO'], $match))
	) {

		/* RETURN THE LANGUAGE FILE AS JAVASCRIPT OBJECT
		-------------------------------------------------------------------- */

		$format = 'js';
		if (isset($match)) {
			$format = array_pop($match);
			$_REQUEST['_lang'] = array_pop($match);
		}

		if ($format == 'json') {
			header('Content-type: application/json; charset=utf-8');
			echo $locale->getJSON();
		} else {
			header('Content-type: text/javascript; charset=utf-8');
			echo 'var $LANG = '.$locale->getJSON().';';
		}

	} else {

		/* LOAD THE VIEW
		-------------------------------------------------------------------- */
		$prefix = '.';
		if (isset($_SERVER['PATH_INFO']) && preg_match('/^\/([a-z0-9_]+)(\/([a-z0-9_]+))?(\/)?/iu', $_SERVER['PATH_INFO'], $match)) {
			array_shift($match);
			$_REQUEST['view'] = array_shift($match);

			if ($match) {
				$prefix = isset($match[2]) && $match[1] != '' ? '../..' : '..';
				$_REQUEST['index'] = $match[1];
			}
		}

		$view = isset($_REQUEST['view']) ? strtolower($_REQUEST['view']) : VIEW_DEFAULT;

		if (!file_exists(ASSET_DIR.'src'.DIRECTORY_SEPARATOR.'views'.DIRECTORY_SEPARATOR.$view.'.js')) {
			header("HTTP/1.0 404 Not Found");
			die('HTTP/1.0 404 Not Found: '.$view);
		}

		echo str_replace(
			[
				'{{view}}',
				'{{lang}}',
				'{{url}}',
				'{{prefix}}',
				'{{index}}'
			],
			[
				$view,
				$locale->getCurrent(),
				substr(BASE_URL, -1) == '/' ? BASE_URL : BASE_URL.'/', // Add a trailing slash to the base URL
				$prefix,
				isset($_REQUEST['index']) ? $_REQUEST['index'] : ''
			],
			file_get_contents(ASSET_DIR.'build'.DIRECTORY_SEPARATOR.'index.html')
		);
	}

} catch(Exception $e) {

	echo str_replace(
		[
			'{{message}}',
			'{{trace}}'
		],
		[
			$e->getFile().' ('.$e->getLine().'): '.$e->getMessage(),
			str_replace("\n", '<br />', htmlentities(REST\errorTrace($e)))
		],
		file_get_contents(ASSET_DIR.'src'.DIRECTORY_SEPARATOR.'template'.DIRECTORY_SEPARATOR.'error.html')
	);

}

?>
