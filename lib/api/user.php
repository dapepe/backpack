<?php
namespace Backpack;

require_once 'collection.php';

/**
 * User API
 *
 * @author Peter-Christoph Haider (Project Leader) et al.
 * @package Backpack
 * @version 1.1
 * @copyright Copyright (c) 2012-2014, Zeyon Technologies
 */
class UserAPI extends API {
	/**
	 * @var array An associative array mapping actions to their definitions.
	 *     Action format:    { <name> => [ <method>, <function>, <parameters> ] }
	 *       Methods:        POST, GET, REQUEST
	 *     Parameter format: [ <name>, <type>, <default> = '', <required> = true ]
	 *       Types:          int, float, bool, array, object, string
	 */
	public $actions = array(
		/*!
		 * @cmd login
		 * @method any
		 * @description Authenticates a user
		 * @param {string} username*
		 * @param {string} password*
		 * @param {bool} session Create a session
		 * @param {bool} cookie Create an auto-login cookie
		 * @return {bool}
		 */
		'login' => array('ANY', 'login', array(
			array('username', 'string', false),
			array('password', 'string', false),
			array('session', 'bool', false, false),
			array('cookie', 'bool', false, false)
		)),
		/*!
		 * @cmd logout
		 * @method any
		 * @description Logout the user
		 * @return {bool}
		 */
		'logout' => array('ANY', 'logout', array()),
		/*!
		 * @cmd session
		 * @method any
		 * @description Returns whether or not a user has an active session
		 * @return {bool}
		 */
		'session' => array('ANY', 'session', array()),
		/*!
		 * @cmd list
		 * @method post
		 * @description List users
		 * @return {bool}
		 */
		'list' => array('ANY', 'list', array()),
		/*!
		 * @cmd update
		 * @method post
		 * @description Add/update user
		 * @param {string} username*
		 * @param {string} password*
		 * @return {bool}
		 */
		'update' => array('POST', 'update', array(
			array('username', 'string', false),
			array('password', 'string', false),
		)),
		/*!
		 * @cmd remove
		 * @method post
		 * @description Add/update user
		 * @param {string} index*
		 * @return {bool}
		 */
		'remove' => array('POST', 'remove', array(
			array('index', 'string', false),
		)),
	);

	public $auth_exceptions = array('auth', 'session');

	/**
	 * Authenticates a user agent
	 *
	 * @param string $strUsername
	 * @param string $password
	 * @param bool $bolSession
	 * @param bool $bolSetCookie
	 */
	public function do_login($strUsername, $strPassword, $bolSession = false, $bolSetCookie = false) {
		return $this->app->initialize($strUsername, $strPassword, $bolSession, $bolSetCookie);
	}


	/**
	 * Lists all users
	 *
	 * @return array
	 * @throws \Exception
	 */
	public function do_list() {
		$this->requireConnection();
		if ($this->app->username != 'root')
			throw new \Exception('Only root can add or remove users.');

		$collection = $this->app->mongoDb->selectCollection($this->app->config['usercollection']);

		$res = [];
		foreach ($collection->find() as $user)
			$res[] = $this->cleanMongoEntity($user);

		return $res;
	}

	/**
	 * Update an existing user
	 *
	 * @param string $strUsername
	 * @param string $strPassword
	 * @return bool
	 * @throws \Exception
	 */
	public function do_update($strUsername, $strPassword) {
		$strUsername = strtolower($strUsername);

		$this->requireConnection();
		if ($this->app->username != 'root')
			throw new \Exception('Only root can update users.');

		$collection = $this->app->mongoDb->selectCollection($this->app->config['usercollection']);
		$user = $collection->findOne(['user' => $strUsername]);

		if ($user === null) {
			// Add a new user
			$collection->insert(['user' => $strUsername, 'pwd' => md5($strUsername . ":mongo:" . $strPassword), 'readOnly' => false]);
		} else {
			// Update the user
			$collection->update(['_id' => $user['_id']], ['user' => $strUsername, 'pwd' => md5($strUsername . ":mongo:" . $strPassword), 'readOnly' => false]);
		}

		return true;
	}

	/**
	 * Remove an existing user
	 *
	 * @param string $strIndex
	 * @return bool
	 * @throws \Exception
	 */
	public function do_remove($strIndex) {
		$this->requireConnection();
		if ($this->app->username != 'root')
			throw new \Exception('Only root can update users.');

		$id = new \MongoId($strIndex);
		$collection = $this->app->mongoDb->selectCollection($this->app->config['usercollection']);
		$user = $collection->findOne(['_id' => $id]);

		if ($user === null)
			return false;

		// Update the user
		$collection->remove(['_id' => $id]);
		return true;
	}

	/**
	 * Logout the user
	 *
	 * @return bool
	 */
	public function do_logout() {
		$this->app->uninitialize();
		return true;
	}

	/**
	 * Returns whether or not a user has an active session
	 *
	 * @return bool
	 */
	public function do_session() {
		try {
			return $this->app->initialize();
		} catch (\Exception $e) {
			return false;
		}
	}
}

?>
