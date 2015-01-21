<?php

// CONFIGURATION TEMPLATE: SIMPLY COPY/RENAME IT TO "config.php"

/**
 * The instance directory include all you instance configurations.
 */
define('INSTANCE_DIR', realpath(BASE_DIR.'instances').DIRECTORY_SEPARATOR);

/**
 * If you are using Imagemagick for image previews, you should make sure that
 * Imagemagick's "convert" command is included in your PATH variable.
 * You can use this constant, to specify an absolute path to the convert command
 * as well.
 */
define('IMAGEMAGIC_CONVERT', 'convert');

/**
 * Defines the base URL for external includes, e.g. if you insert a local image
 * to one of your HTML pages through the image picker.
 *
 * Ideally, this should be the absolute URL to your Backpack installation.
 */
define('BASE_URL', './');