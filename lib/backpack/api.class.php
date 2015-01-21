<?php
namespace Backpack;

/**
 * Basic application API class
 *
 * The API's run() function should be designed to perform the authentication before executing the function
 *
 * @author Peter-Christoph Haider (Project Leader) et al.
 * @package Backpack
 * @version 1.1
 * @copyright Copyright (c) 2012-2014, Zeyon Technologies
 */
class API extends \REST\Server {

	/**
	 * Recursivley run through array and convert all values like
	 * "true", "TRUE" = true and
	 * "false, "FALSE" = false
	 */
	static public function recStringBool2Bool(&$array) {
		if ( is_array($array) ) {
			foreach ( $array as &$value ) {
				API::recStringBool2Bool($value);
			}
		} else {
			$v = strtolower($array);
			if ( $v == 'true' )
				$array = true;
			else if ( $v == 'false' )
				$array = false;
		}

		return $array;
	}

	/** @var User The currently selected agent */
	public $user;
	/** @var Domain The currently selected domain */
	public $domain;
	/** @var string The application salt */
	public $salt = 'Zgds623kHjd235Gshdw';
	/** @var int The duration for the autologin cookie in days */
	public $cookieDuration = 14;

	public function __construct() {
		parent::__construct();
		$this->showtrace = true;
		$this->app = App::getInstance();
	}

	public static function create() {
		return new self();
	}

	/**
	 * Only runs a function, if a valid authentication token has been sent.
	 */
	public function run() {
		if (!isset($_REQUEST['do']))
			throw new \Exception('No task specified.');

		if (!in_array($_REQUEST['do'], $this->auth_exceptions) && !$this->auth())
			throw new \Exception('Authentication required.');

		$this->runJSON();
	}

	/**
	 * Requires an active application session
	 *
	 * @param bool $bolStrict Throws an exception if application is not initialized
	 * @return User
	 */
	public function requireConnection($bolStrict=true) {
		if ($this->app->initialize())
			return true;

		if (!$bolStrict)
			return false;

		throw new \Exception('Application connection required for this operation');
	}

	/**
	 * Initializes localization for the filter array
	 *
	 * @param array $arrFilter
	 * @param Localizer $locale
	 * @return array
	 */
	public function initFilter($arrFilter, $locale = false) {
		if (!$locale)
			$locale = Localizer::getInstance();

		foreach ($arrFilter as $key => &$F) {
			if (!isset($F['field'])) {
				$F['field'] = $key;
			}
			$l = $locale->get($F['field'], false);
			if ( $l !== false ) {
				$F['field'] = $l;
			} else if ( isset($F['label']) ) {
				$F['field'] = $F['label'];
			}
		}

		return $arrFilter;
	}

	/**
	 * Returns an option
	 *
	 * @param string $key The option name
	 * @return string
	 */
	protected function getOption($key) {
		return isset($this->options[$key]) ? $this->options[$key] : false;
	}

	/**
	 * Sets an option
	 *
	 * @param string $key The option name
	 */
	protected function setOption($key, $value=null) {
		if ($value == null)
			unset($this->options[$key]);
		else
			$this->options[$key] = $value;
	}

	/**
	 * Set options
	 *
	 * @param array $options
	 */
	protected function setOptions($options) {
		if (!is_array($options) || !$options)
			return;
		foreach ($options as $key => $value) {
			switch (strtolower($value)) {
				case 'true':
					$this->setOption($key, true);
					break;
				case 'false':
					$this->setOption($key, false);
					break;
				default:
					$this->setOption($key, $value);
					break;
			}
		}
	}

	/**
	 * Clean some mongo db special structures to simplified strings.
	 * For example:
	 *     MongoId _id -> (string) _id
	 *     MongoDate -> (int)
	 *
	 * Resolve user ids with there entity.
	 *
	 * @param array $data The array to convert
	 * @parm array $keys The keys of the array to check.
	 */
	public function cleanMongoEntity(&$data) {
		foreach ($data as &$value) {
			if ($value instanceof \MongoDate)
				$value = (int) $value->sec;
			elseif ($value instanceof \MongoId) {
				$value = (string) $value;
			}
		}

		return $data;
	}

}

class APIFactory {
	/**
	 * @var array An associative array mapping API class names to {@link API} objects.
	 */
	static private $instances = array();

	static public function getUserSession() {
		return (new API())->getUserSession();
	}

	/**
	 * Returns the specified API instance.
	 *
	 * Throws an exception on errors.
	 *
	 * @param string $apiName
	 * @return API
	 */
	static public function get($apiName) {
		if ( !file_exists(API_DIR.$apiName.'.php') )
			throw new \Exception('Unknown API "'.$apiName.'".');

		$apiClass = '\\Backpack\\'.ucfirst($apiName).'API';

		if ( isset(self::$instances[$apiClass]) )
			return self::$instances[$apiClass];

		// Load and instantiate API class

		require_once(API_DIR.$apiName.'.php');

		if ( !class_exists($apiClass) )
			throw new \Exception('Unknown API "'.$apiClass.'".');

		$api = new $apiClass();
		if ( !($api instanceof API) )
			throw new \Exception('Invalid API "'.$apiName.'".');

		self::$instances[$apiClass] = $api;

		return $api;
	}
}
