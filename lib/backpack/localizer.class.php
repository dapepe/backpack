<?php

/**
 * Localizer class
 *
 * @author Peter-Christoph Haider (Project Leader) et al.
 * @package Backpack
 * @version 1.1
 * @copyright Copyright (c) 2012-2014, Zeyon Technologies
 */
class Localizer extends \REST\Localizer {
	/** @var Localizer The singelton instance */
	private static $instance = NULL;

	public $strFileFormat = 'yml';

	/**
	 * Return the current instance
	 *
	 * @param array $arrAccepted All accepted languages
	 * @param string $strDefault Default language code
	 * @return Localizer
	 */
	public static function getInstance($arrAccepted=array(), $strDefault='de') {
		if (self::$instance === NULL)
			self::$instance = new self($arrAccepted, $strDefault);
		return self::$instance;
	}

	public function getJSON($strCachePath=false) {
		// if (is_dir(CACHE_DIR)) {
		// 	if (file_exists(CACHE_DIR.$this->strCurrent.'.json'))
		// 		return file_get_contents(CACHE_DIR.$this->strCurrent.'.json');
		// }

		return json_encode($this->arrData);
	}
}
