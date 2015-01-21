<?php

/**
 * Cleanup script
 *
 * @author Peter-Christoph Haider (Project Leader) et al.
 * @package Backpack
 * @version 1.1
 * @copyright Copyright (c) 2012-2014, Zeyon Technologies
 */

// Load main libraries and constants
require_once(dirname(__FILE__).DIRECTORY_SEPARATOR.'bootstrap.php');

foreach (scandir(INSTANCE_DIR) as $dir) {
	if (substr($dir, 0, 1) == '.' || !is_dir(INSTANCE_DIR.$dir))
		continue;

	if (!is_dir(INSTANCE_DIR.$dir.DIRECTORY_SEPARATOR.'cache'))
		continue;

	foreach (scandir(INSTANCE_DIR.$dir.DIRECTORY_SEPARATOR.'cache') as $file) {
		if (!is_dir(INSTANCE_DIR.$dir.DIRECTORY_SEPARATOR.'cache'.DIRECTORY_SEPARATOR.$file))
			unlink(INSTANCE_DIR.$dir.DIRECTORY_SEPARATOR.'cache'.DIRECTORY_SEPARATOR.$file);
	}
}