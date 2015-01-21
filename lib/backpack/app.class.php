<?php
namespace Backpack;

/**
 * Application class
 *
 * The API's run() function should be designed to perform the authentication before executing the function
 *
 * @author Peter-Christoph Haider (Project Leader) et al.
 * @package Backpack
 * @version 1.1
 * @copyright Copyright (c) 2012-2014, Zeyon Technologies
 */
class App {
	/** @var App The singelton instance */
	private static $instance = null;
	/** @var MongoClient */
	public $mongoClient = null;
	/** @var MongoDB */
	public $mongoDb = null;
	/** @var string */
	private $salt = 'dshKJGdkfbvd3t74Bjuzdfbv347oiv';
	/** @var int */
	private $cookieDuration = 14;
	/** @var array */
	private $session = null;
	/** @var array Instance configuration file */
	public $config = null;
	/** @var string The current user */
	public $username;

	/** @var array */
	private $usercache = [];

	/**
	 * Return the current instance and invoce initialization
	 *
	 * @return App
	 */
	public static function getInstance() {
		if (self::$instance === NULL)
			self::$instance = new self();

		return self::$instance;
	}

	/**
	 * Initialize the application connection
	 *
	 * @param  stirng $strUsername
	 * @param  string $strPassword
	 * @param  bool   $bolSession
	 * @param  bool   $bolCookie
	 * @return bool
	 */
	public function initialize($strUsername = null, $strPassword = null, $bolSession = false, $bolCookie = false) {
		if ($this->getInitStatus())
			return $this->session;

		if ($strUsername == null) {
			if (isset($_SESSION['username']) && isset($_SESSION['password']) && isset($_SESSION['appid'])) {
				$strUsername = $_SESSION['username'];
				$strPassword = $_SESSION['password'];
				$strAppId    = $_SESSION['appid'];
			} elseif (isset($_COOKIE['token'])) {
				$t = \cryptastic::decrypt($_COOKIE['token'], $this->salt);
				if (isset($t['username']) && isset($t['password']) && isset($t['appid'])
					&& isset($t['expiration']) && $t['expiration'] > time()) {
					$strUsername = $t['username'];
					$strPassword = $t['password'];
					$strAppId    = $t['appid'];
				}
			}
		}

		if (!$strUsername || !$strPassword)
			throw new \Exception('Username/password not specified!');

		// Get the App ID from the username (user@appid)
		if (!isset($strAppId)) {
			if (preg_match('/([A-Z0-9._-]+)@([A-Z0-9._-]+)/i', $strUsername, $matches)) {
				$strAppId    = array_pop($matches);
				$strUsername = array_pop($matches);
			}
		}

		if (!isset($strAppId))
			throw new \Exception('Invalid username: {username}@{instanceid}');

		// Load the instance configuration
		$this->config = $this->getInstanceConfig($strAppId);

		// Establish the MongoDB connection
		$this->mongoClient = new \MongoClient($this->config['mongo']['host']);
		$this->mongoDb     = $this->mongoClient->selectDB($this->config['mongo']['db']);

		// Store the version number for compatibility
		$connection = $this->mongoClient->getConnections();
		$this->isVersion244 = isset($connection[0]) && $connection[0]['server']['version']['major'] == 2 && $connection[0]['server']['version']['mini'] == 4;

		// Authenticate the user
		if ($strUsername == 'root') {
			if ($strPassword != $this->config['rootpwd'])
				throw new \Exception('Invalid username or password');
		} else {
			// Validate username and password
			$user = $this->mongoDb->selectCollection($this->config['usercollection'])->findOne(['user' => $strUsername]);
			if (!(is_array($user) && isset($user['pwd']) && md5($strUsername.":mongo:".$strPassword) == md5($strUsername.":mongo:".$user['pwd'])))
				throw new \Exception('Invalid username or password');
		}

		$this->username = $strUsername;

		if (!file_exists(CACHE_DIR))
			mkdir(CACHE_DIR);

		$this->session = array(
			'username'    => $strUsername,
			'db'          => $strAppId,
			'session'     => $bolSession,
			'cookie'      => $bolCookie,
			'PHPSESSID'   => session_id()
		);

		if ($bolSession) {
			$_SESSION['username'] = $strUsername;
			$_SESSION['password'] = $strPassword;
			$_SESSION['appid']    = $strAppId;
		}
		if ($bolCookie) {
			setcookie('token', \cryptastic::encrypt(array(
				'username' => $strUsername,
				'password' => $strPassword,
				'appid'    => $strAppId,
				'expiration' => time() + 8600 * $this->cookieDuration
			), $this->salt), time() + 86400 * $this->cookieDuration);
		}

		return $this->session;
	}

	/**
	 * Unsets the current instance and removes all cached authentication data
	 *
	 * @return void
	 */
	public function uninitialize() {
		unset($_SESSION['username']);
		unset($_SESSION['password']);
		unset($_SESSION['appid']);
		setcookie('token', '', time() - 3600);
		unset($_COOKIE['token']);
	}

	/**
	 * Resturns the instance configuration
	 *
	 * @param $strAppId
	 * @throws \Exception
	 * @return array
	 */
	public function getInstanceConfig($strAppId) {
		// Check the instance directory
		$strAppDir = INSTANCE_DIR.$strAppId.DIRECTORY_SEPARATOR;

		if (!is_dir($strAppDir))
			throw new \Exception('Instance not found: '.$strAppId);
		if (!is_readable($strAppDir.'config.json'))
			throw new \Exception('No configuration file found for instance '.$strAppId);

		// Read the settings file
		$config = json_decode(file_get_contents($strAppDir.'config.json'), true);

		if (!isset($config['mongo']))
			$config['mongo'] = [];

		// Initialize the Bluemix/CF configuration
		if (isset($config['mongo']['service'])) {
			$services = json_decode(getenv("VCAP_SERVICES"), true);
			foreach ($services as $service) {
				if ($service['name'] == $config['mongo']['service']) {
					$config['mongo'] = array_merge($config['mongo'], $service['name']);
					break;
				}
			}

			if (!isset($config['mongo']['host']))
				throw new \Exception('No configuration found for service '.$config['mongo']['service']);
		} else {
			if (!isset($config['mongo']['host']))
				$config['mongo']['host'] = 'mongodb://127.0.0.1:27017';
			if (!isset($config['mongo']['db']))
				$config['mongo']['db'] = $strAppId;
		}

		if (!isset($config['cache']))
			$config['cache'] = './cache';
		$config['cache'] = realpath($strAppDir.$config['cache']);

		if (!defined('APP_ID'))
			define('APP_ID', $strAppId);
		if (!defined('APP_DIR'))
			define('APP_DIR', $strAppDir);
		if (!defined('CACHE_DIR'))
			define('CACHE_DIR', APP_DIR.'cache'.DIRECTORY_SEPARATOR);

		// Initialize the user collection
		if (!isset($config['usercollection']))
			$config['usercollection'] = 'system.users';

		if (!isset($config['rootpwd']))
			$config['rootpwd'] = 'backpack';

		if (!isset($config['historylength']) || !is_int($config['historylength']))
			$config['historylength'] = 0;

		return $config;
	}

	/**
	 * Returns the MongoDB Object
	 *
	 * @return MongoDB
	 */
	public function getDb() {
		return $this->mongoDb;
	}

	/**
	 * Returns the MongoClient Object
	 *
	 * @return MongoClient
	 */
	public function getClient() {
		return $this->mongoClient;
	}

	/**
	 * Return the session variable
	 *
	 * @return array|string
	 */
	public function getSession($key=false) {
		return $key ? (isset($this->session[$key]) ? $this->session[$key] : null) : $this->session;
	}

	/**
	 * Returns the initialization status
	 *
	 * @return bool
	 */
	public function getInitStatus() {
		return defined('APP_DIR') && defined('APP_ID') && $this->session && $this->mongoClient instanceof \MongoClient && $this->mongoDb instanceof \MongoDB;
	}

	/**
	 * Checks, if a file is inside the app directory
	 *
	 * @param  string  $strFile
	 * @param  boolean $bolCheckExists Checks, if the file already exists
	 * @return string The formatted file path
	 */
	public function checkFileLocation($strFile, $bolCheckExists=true) {
		if ($bolCheckExists && !file_exists(APP_DIR.$strFile))
			throw new \Exception('Directory not found: '.APP_DIR.$strFile);

		$realpath = realpath(dirname(APP_DIR.$strFile)).DIRECTORY_SEPARATOR;
		if (strpos($realpath, APP_DIR) === false)
			throw new \Exception('Directory is outside the application directory! "'.$strFile.'" | "'.$realpath.'" "'.APP_DIR.'"');

		return $realpath.pathinfo($strFile, PATHINFO_BASENAME);
	}

	/**
	 * Return path beginning from the APP_DIR.
	 *
	 * @param string $path The Absolute path.
	 * @return string
	 */
	public function getPathRelToAppDir($path) {
		if ( strpos($path, APP_DIR) === 0 ) {
			return substr($path, strlen(APP_DIR));
		}

		return $path;
	}

	/**
	 * Shows the collection settings
	 *
	 * @param  string $strCollection
	 * @return array
	 */
	public function showCollection($strCollection) {
		$strCollectionFile = $this->checkFileLocation('collections'.DIRECTORY_SEPARATOR.$strCollection.'.json');
		if (!file_exists($strCollectionFile))
			throw new Exception('Collection settings not found: '.$strCollection);

		return json_decode(file_get_contents($strCollectionFile), 1);
	}
}

?>
